const recipeForm = document.querySelector("#recipeForm");

const recipeTitle = document.querySelector("#recipeTitle");
const recipeDescription = document.querySelector("#recipeDescription");
const category = document.querySelector("#category");
const cookingTime = document.querySelector("#cookingTime");
const ingredients = document.querySelector("#ingredients");
const instructions = document.querySelector("#instructions");

const recipeImage = document.querySelector("#recipeImage");
const imagePreview = document.querySelector("#imagePreview");
const chooseImageBtn = document.querySelector("#chooseImageBtn");

let profileName = document.querySelector("#profileName");
let profileInitial = document.querySelector("#profileInitial");

async function getUser() {
  console.log("getuser");

  // get user
  const {
    data: { user },
  } = await client.auth.getUser();

  console.log(user.id);

  // select user name
  const { data, error } = await client
    .from("user_data")
    .select("first_name, last_name")
    .eq("user_id", user.id);

  let firstName = data[0].first_name;
  let lastName = data[0].last_name;

  let name = `${firstName} ${lastName}`;
  profileName.innerHTML = name;

  profileInitial.innerHTML = `${firstName[0]}${lastName[0]}`;

  if (error) {
    console.log(error.message);
    return;
  }
}

getUser();

// ================= IMAGE CHOOSE =================

chooseImageBtn.addEventListener("click", () => {
  recipeImage.click();
});

// ================= IMAGE PREVIEW =================

recipeImage.addEventListener("change", () => {
  const file = recipeImage.files[0];

  if (!file) return;

  const imageUrl = URL.createObjectURL(file);

  imagePreview.src = imageUrl;
  imagePreview.classList.remove("d-none");
});

// ================= ADD RECIPE =================

recipeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    // Get logged-in user
    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();

    if (userError || !user) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login first.",
      });

      return;
    }

    // ================= GET CATEGORY ID =================

    const { data: categoryData, error: categoryError } = await client
      .from("category")
      .select("id")
      .eq("name", category.value)
      .single();

    if (categoryError) {
      console.log(categoryError);

      Swal.fire({
        icon: "error",
        title: "Category Error",
        text: categoryError.message,
      });

      return;
    }

    // ================= IMAGE UPLOAD =================

    let imageUrl = null;

    const imageFile = recipeImage.files[0];

    if (imageFile) {
      const uploadContent = document.querySelector("#uploadContent");
      uploadContent.innerHTML = "";
      const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;

      const { error: uploadError } = await client.storage
        .from("recipe-images")
        .upload(fileName, imageFile, {
          cacheControl: "3600",
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.log(uploadError);

        Swal.fire({
          icon: "error",
          title: "Image Upload Failed",
          text: uploadError.message,
        });

        return;
      }

      // Get public URL

      const { data: publicUrlData } = client.storage
        .from("recipe-images")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    // ================= INSERT RECIPE =================

    const { data: recipeData, error: recipeError } = await client
      .from("recipes")
      .insert([
        {
          user_id: user.id,
          category_id: categoryData.id,
          title: recipeTitle.value.trim(),
          description: recipeDescription.value.trim(),
          instructions: instructions.value.trim(),
          cooking_time: Number(cookingTime.value),
          image_url: imageUrl,
        },
      ])
      .select()
      .single();

    if (recipeError) {
      console.log(recipeError);

      Swal.fire({
        icon: "error",
        title: "Recipe Not Added",
        text: recipeError.message,
      });

      return;
    }

    // ================= INGREDIENTS =================

    /*
      HTML mein ingredients ek line per ingredient hain:

      2 cups rice
      500g chicken
      1 onion
      2 tomatoes
    */

    const ingredientLines = ingredients.value
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    if (ingredientLines.length > 0) {
      const ingredientData = ingredientLines.map((item) => ({
        recipe_id: recipeData.id,

        ingredient_name: item,

        quantity: null,
      }));

      const { error: ingredientError } = await client
        .from("ingredients")
        .insert(ingredientData);

      if (ingredientError) {
        console.log(ingredientError);

        Swal.fire({
          icon: "warning",
          title: "Recipe Added",
          text: "Recipe added, but ingredients could not be saved.",
        });

        return;
      }
    }

    // ================= SUCCESS =================

    Swal.fire({
      icon: "success",
      title: "Recipe Added!",
      text: "Your recipe has been added successfully.",
      confirmButtonText: "My Recipes",
    }).then(() => {
      window.location.href = "./pages/myRecipe.html";
    });

    // Reset form
    recipeForm.reset();

    imagePreview.src = "";
    imagePreview.classList.add("d-none");
  } catch (error) {
    console.log(error);

    Swal.fire({
      icon: "error",
      title: "Something Went Wrong",
      text: error.message,
    });
  }
});
