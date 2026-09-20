// ================= PROFILE =================

let profileName = document.querySelector("#profileName");
let profileInitial = document.querySelector("#profileInitial");


// ================= GET USER PROFILE =================

async function getUser() {
  try {
    const {
      data: { user },
      error: authError
    } = await client.auth.getUser();

    if (authError || !user) {
      window.location.href = "login.html";
      return null;
    }
    console.log("Logged in user:", user.id);

    const {
      data,
      error
    } = await client
      .from("user_data")
      .select("first_name, last_name")
      .eq("user_id", user.id)
      .single();

    if (error) {
   console.log("Profile error:", error.message);
      return user;
    }

    if (data) {
      let firstName = data.first_name || "";
      let lastName = data.last_name || "";
      let name =
        `${firstName} ${lastName}`.trim();
      if (profileName) {
        profileName.textContent = name;
      }
     if (profileInitial) {
        profileInitial.textContent =
          `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

      }

    }
  return user;
  } catch (error) {
    console.log(error);
    return null;
  }

}


// ================= RECIPES CONTAINER =================

const myRecipes =
  document.getElementById("myRecipes");


// ================= GET MY RECIPES =================

async function getMyRecipes() {
  try {

    // ================= GET USER =================
    const {
      data: { user },
      error: userError
    } = await client.auth.getUser();

    if (userError || !user) {
      window.location.href = "login.html";
      return;
    }

    // ================= GET RECIPES =================

    const {
      data,
      error
    } = await client
      .from("recipes")
      .select(`
        id,
        title,
        description,
        instructions,
        cooking_time,
        image_url,
        created_at,
        category_id,
        category (
          id,
          name
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false
      });

    if (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message
      });
      return;
    }

    console.log(data);
    displayRecipes(data);
  } catch (error) {
    console.log(error);
  }

}


// ================= DISPLAY RECIPES =================

function displayRecipes(recipes) {
  myRecipes.innerHTML = "";


  // ================= NO RECIPES =================

  if (!recipes || recipes.length === 0) {

    myRecipes.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fa-solid fa-utensils fa-3x text-muted mb-3"></i>
        <h4>No Recipes Yet</h4>
        <p class="text-muted">
          You haven't created any recipes yet.
        </p>
        <a
          href="addRecipe.html"
          class="btn btn-warning"
        >
          <i class="fa-solid fa-plus me-2"></i>
          Add Recipe
        </a>
      </div>
    `;
    return;
  }


  // ================= RECIPES LOOP =================

  recipes.forEach((recipe) => {
    const date =
      new Date(recipe.created_at)
        .toLocaleDateString();
    myRecipes.innerHTML += `
      <div
        class="col-md-6 col-lg-4 mb-4"
        id="recipeCard-${recipe.id}"
      >
        <div
          class="card h-100 shadow-sm border-0"
          id="card-${recipe.id}"
        >
          <!-- ================= IMAGE ================= -->
          <div
            style="
              height:220px;
              overflow:hidden;
            "
          >
            ${recipe.image_url
        ?
        `
                <img
                  src="${recipe.image_url}"
                  alt="${recipe.title}"
                  class="w-100 h-100"
                  style="object-fit:cover;"
                >
              `
        :
        `

                <div
                  class="
                    w-100
                    h-100
                    d-flex
                    align-items-center
                    justify-content-center
                    bg-light
                  "
                >

                  <i
                    class="
                      fa-solid
                      fa-utensils
                      fa-3x
                      text-muted
                    "
                  ></i>

                </div>

              `
      }

          </div>
          <!-- ================= CARD BODY ================= -->
          <div class="card-body">

            <!-- CATEGORY -->

            <span
              class="
                badge
                bg-warning
                text-dark
                mb-2
              "
            >

              ${recipe.category?.name ||
      "Uncategorized"
      }

            </span>

            <!-- TITLE -->

            <h5 class="card-title fw-bold">
              ${recipe.title}
            </h5>


            <!-- DESCRIPTION -->
            <p class="card-text text-muted">
              ${recipe.description?.length > 100
        ?
        recipe.description.substring(0, 100) + "..."
        :
        recipe.description || ""
      }

            </p>

            <!-- ================= INFO ================= -->
            <div
              class="
                d-flex
                justify-content-between
                text-muted
                small
                mb-3
              "
            >
              <span>
                <i
                  class="
                    fa-regular
                    fa-clock
                    me-1
                  "
                ></i>
               ${recipe.cooking_time} mins
              </span>
              <span>
               <i
                  class="
                    fa-regular
                    fa-calendar
                    me-1
                  "
                ></i>
                ${date}
              </span>
            </div>

            <!-- ================= BUTTONS ================= -->

            <div class="d-flex gap-2">
              <!-- VIEW -->
              <a
                href="recipeDetails.html?id=${recipe.id}"
                class="
                  btn
                  btn-outline-dark
                  btn-sm
                  flex-grow-1
                "
              >

                <i
                  class="
                    fa-solid
                    fa-eye
                    me-1
                  "
                ></i>
               View
             </a>


              <!-- EDIT -->

              <button
                type="button"
                class="
                  btn
                  btn-outline-warning
                  btn-sm
                  editBtn
                "
                data-id="${recipe.id}"
              >

                <i
                  class="fa-solid fa-pen"
                ></i>

              </button>


              <!-- DELETE -->

              <button
                type="button"
                class="
                  btn
                  btn-outline-danger
                  btn-sm
                "
                onclick="deleteRecipe(${recipe.id})"
              >

                <i
                  class="
                    fa-solid
                    fa-trash
                  "
                ></i>

              </button>

            </div>

          </div>

        </div>

      </div>

    `;

  });

}


// ================= EDIT RECIPE ========================

document.addEventListener(
  "click",
  async (e) => {

    const editBtn =
      e.target.closest(".editBtn");


    if (!editBtn) {
      return;
    }


    const recipeId =
      editBtn.dataset.id;


    if (!recipeId) {
      return;
    }


    // Get recipe

    const {
      data: recipe,
      error
    } = await client
      .from("recipes")
      .select(`
        id,
        title,
        description,
        instructions,
        cooking_time,
        image_url,
        category_id,
        category (
          id,
          name
        )
      `)
      .eq("id", recipeId)
      .single();


    if (error) {

      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message
      });

      return;
    }


    // ================= GET CATEGORIES =================

    const {
      data: categories,
      error: categoryError
    } = await client
      .from("category")
      .select("id, name")
      .order("name");


    if (categoryError) {

      console.log(categoryError);

      Swal.fire({
        icon: "error",
        title: "Category Error",
        text: categoryError.message
      });

      return;
    }


    // ================= GET INGREDIENTS =================

    const {
      data: ingredientData,
      error: ingredientError
    } = await client
      .from("ingredients")
      .select(`
        ingredient_name,
        quantity
      `)
      .eq("recipe_id", recipeId);


    if (ingredientError) {

      console.log(ingredientError);

      Swal.fire({
        icon: "error",
        title: "Ingredients Error",
        text: ingredientError.message
      });

      return;
    }


    // ================= INGREDIENT TEXT =================

    let ingredientText = "";


    if (
      ingredientData &&
      ingredientData.length > 0
    ) {

      ingredientText =
        ingredientData
          .map(item => {

            if (item.quantity) {

              return `${item.quantity} ${item.ingredient_name}`;

            }

            return item.ingredient_name;

          })
          .join("\n");

    }


    // ================= CATEGORY OPTIONS =================

    let categoryOptions = `
      <option value="">
        Select Category
      </option>
    `;


    categories.forEach(item => {

      categoryOptions += `

        <option
          value="${item.id}"
          ${item.id == recipe.category_id
          ? "selected"
          : ""
        }
        >
          ${item.name}
        </option>

      `;

    });


    // ================= REPLACE CARD =================

    const card =
      document.getElementById(
        `card-${recipeId}`
      );


    if (!card) {
      return;
    }


    card.innerHTML = `

      <div class="card-body">

        <!-- ================= EDIT TITLE ================= -->

        <h5 class="fw-bold mb-3">

          <i
            class="
              fa-solid
              fa-pen-to-square
              text-warning
              me-2
            "
          ></i>

          Edit Recipe

        </h5>


        <!-- ================= TITLE ================= -->

        <div class="mb-3">

          <label
            class="form-label fw-semibold"
          >
            Recipe Title
          </label>

          <input
            type="text"
            class="form-control"
            id="editTitle-${recipeId}"
            value="${escapeHTML(recipe.title || "")}"
          >

        </div>


        <!-- ================= CATEGORY ================= -->

        <div class="mb-3">

          <label
            class="form-label fw-semibold"
          >
            Category
          </label>

          <select
            class="form-select"
            id="editCategory-${recipeId}"
          >

            ${categoryOptions}

          </select>

        </div>


        <!-- ================= COOKING TIME ================= -->

        <div class="mb-3">

          <label
            class="form-label fw-semibold"
          >
            Cooking Time
          </label>

          <div class="input-group">

            <input
              type="number"
              min="1"
              class="form-control"
              id="editTime-${recipeId}"
              value="${recipe.cooking_time || ""}"
            >

            <span class="input-group-text">
              mins
            </span>

          </div>

        </div>


        <!-- ================= DESCRIPTION ================= -->

        <div class="mb-3">

          <label
            class="form-label fw-semibold"
          >
            Description
          </label>

          <textarea
            class="form-control"
            rows="3"
            id="editDescription-${recipeId}"
          >${escapeHTML(recipe.description || "")}</textarea>

        </div>


        <!-- ================= INGREDIENTS ================= -->

        <div class="mb-3">

          <label
            class="form-label fw-semibold"
          >
            Ingredients
          </label>

          <textarea
            class="form-control"
            rows="5"
            id="editIngredients-${recipeId}"
            placeholder="One ingredient per line"
          >${escapeHTML(ingredientText)}</textarea>

          <small class="text-muted">
            Write one ingredient per line.
          </small>

        </div>


        <!-- ================= INSTRUCTIONS ================= -->

        <div class="mb-3">

          <label
            class="form-label fw-semibold"
          >
            Instructions
          </label>

          <textarea
            class="form-control"
            rows="5"
            id="editInstructions-${recipeId}"
          >${escapeHTML(recipe.instructions || "")}</textarea>

        </div>


        <!-- ================= IMAGE ================= -->

        <div class="mb-3">

          <label
            class="form-label fw-semibold"
          >
            Recipe Image
          </label>


          ${recipe.image_url

        ?

        `

              <img
                src="${recipe.image_url}"
                id="editImagePreview-${recipeId}"
                class="
                  img-fluid
                  rounded
                  mb-2
                "
                style="
                  height:150px;
                  width:100%;
                  object-fit:cover;
                "
              >

            `

        :

        `

              <div
                id="editImagePreview-${recipeId}"
                class="
                  bg-light
                  rounded
                  d-flex
                  align-items-center
                  justify-content-center
                  mb-2
                "
                style="height:150px;"
              >

                <i
                  class="
                    fa-solid
                    fa-utensils
                    fa-2x
                    text-muted
                  "
                ></i>

              </div>

            `
      }


          <input
            type="file"
            class="form-control"
            id="editImage-${recipeId}"
            accept="image/jpeg,image/png,image/webp"
          >

        </div>


        <!-- ================= BUTTONS ================= -->

        <div class="d-flex gap-2">

          <button
            type="button"
            class="
              btn
              btn-warning
              flex-grow-1
              updateRecipeBtn
            "
            data-id="${recipeId}"
          >

            <i
              class="
                fa-solid
                fa-check
                me-1
              "
            ></i>

            Update

          </button>


          <button
            type="button"
            class="
              btn
              btn-outline-secondary
              cancelEditBtn
            "
            data-id="${recipeId}"
          >

            Cancel

          </button>

        </div>

      </div>

    `;


    // ================= IMAGE PREVIEW =================

    const imageInput =
      document.getElementById(
        `editImage-${recipeId}`
      );


    imageInput.addEventListener(
      "change",
      () => {

        const file =
          imageInput.files[0];


        if (!file) {
          return;
        }


        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp"
        ];


        if (!allowedTypes.includes(file.type)) {

          Swal.fire({
            icon: "error",
            title: "Invalid Image",
            text: "Please select JPG, PNG or WEBP."
          });


          imageInput.value = "";

          return;
        }


        const preview =
          document.getElementById(
            `editImagePreview-${recipeId}`
          );


        const imageURL =
          URL.createObjectURL(file);


        if (preview.tagName === "IMG") {

          preview.src = imageURL;

        } else {

          preview.outerHTML = `

            <img
              src="${imageURL}"
              id="editImagePreview-${recipeId}"
              class="
                img-fluid
                rounded
                mb-2
              "
              style="
                height:150px;
                width:100%;
                object-fit:cover;
              "
            >

          `;

        }

      }
    );

  }
);


// ================= CANCEL EDIT ========================

document.addEventListener(
  "click",
  (e) => {

    const cancelBtn =
      e.target.closest(".cancelEditBtn");


    if (!cancelBtn) {
      return;
    }


    // Simply reload recipes

    getMyRecipes();

  }
);


// ================= UPDATE RECIPE ======================

document.addEventListener(
  "click",
  async (e) => {

    const updateBtn =
      e.target.closest(".updateRecipeBtn");


    if (!updateBtn) {
      return;
    }


    const recipeId =
      updateBtn.dataset.id;


    if (!recipeId) {
      return;
    }


    // ================= GET USER =================

    const {
      data: { user },
      error: userError
    } = await client.auth.getUser();


    if (userError || !user) {

      window.location.href =
        "login.html";

      return;
    }


    // ================= GET INPUTS =================

    const titleInput =
      document.getElementById(
        `editTitle-${recipeId}`
      );


    const categoryInput =
      document.getElementById(
        `editCategory-${recipeId}`
      );


    const timeInput =
      document.getElementById(
        `editTime-${recipeId}`
      );


    const descriptionInput =
      document.getElementById(
        `editDescription-${recipeId}`
      );


    const ingredientsInput =
      document.getElementById(
        `editIngredients-${recipeId}`
      );


    const instructionsInput =
      document.getElementById(
        `editInstructions-${recipeId}`
      );


    const imageInput =
      document.getElementById(
        `editImage-${recipeId}`
      );


    // ================= VALIDATION =================

    if (!titleInput.value.trim()) {

      Swal.fire({
        icon: "warning",
        title: "Title Required",
        text: "Please enter recipe title."
      });

      return;
    }


    if (!categoryInput.value) {

      Swal.fire({
        icon: "warning",
        title: "Category Required",
        text: "Please select category."
      });

      return;
    }


    if (!timeInput.value) {

      Swal.fire({
        icon: "warning",
        title: "Cooking Time Required",
        text: "Please enter cooking time."
      });

      return;
    }


    if (!descriptionInput.value.trim()) {

      Swal.fire({
        icon: "warning",
        title: "Description Required",
        text: "Please enter description."
      });

      return;
    }


    if (!ingredientsInput.value.trim()) {

      Swal.fire({
        icon: "warning",
        title: "Ingredients Required",
        text: "Please enter ingredients."
      });

      return;
    }


    if (!instructionsInput.value.trim()) {

      Swal.fire({
        icon: "warning",
        title: "Instructions Required",
        text: "Please enter instructions."
      });

      return;
    }


    // ================= CURRENT RECIPE =================

    const {
      data: oldRecipe,
      error: oldRecipeError
    } = await client
      .from("recipes")
      .select("image_url")
      .eq("id", recipeId)
      .eq("user_id", user.id)
      .single();


    if (oldRecipeError) {

      console.log(oldRecipeError);

      Swal.fire({
        icon: "error",
        title: "Recipe Error",
        text: oldRecipeError.message
      });

      return;
    }


    let imageUrl =
      oldRecipe.image_url || null;


    // ================= NEW IMAGE =================

    if (
      imageInput &&
      imageInput.files.length > 0
    ) {

      const imageFile =
        imageInput.files[0];


      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
      ];


      if (!allowedTypes.includes(imageFile.type)) {

        Swal.fire({
          icon: "error",
          title: "Invalid Image",
          text: "Please select JPG, PNG or WEBP."
        });

        return;
      }


      // Unique file name

      const fileName =
        `${user.id}/${Date.now()}-${imageFile.name}`;


      // ================= UPLOAD IMAGE =================

      const {
        error: uploadError
      } = await client.storage
        .from("recipe-images")
        .upload(
          fileName,
          imageFile,
          {
            cacheControl: "3600",
            contentType: imageFile.type,
            upsert: false
          }
        );


      if (uploadError) {

        console.log(uploadError);

        Swal.fire({
          icon: "error",
          title: "Image Upload Failed",
          text: uploadError.message
        });

        return;
      }


      // ================= GET PUBLIC URL =================

      const {
        data: publicUrlData
      } = client.storage
        .from("recipe-images")
        .getPublicUrl(fileName);


      imageUrl =
        publicUrlData.publicUrl;

    }


    // ================= UPDATE RECIPE =================

    const {
      error: updateError
    } = await client
      .from("recipes")
      .update({

        title:
          titleInput.value.trim(),

        description:
          descriptionInput.value.trim(),

        category_id:
          Number(categoryInput.value),

        cooking_time:
          Number(timeInput.value),

        instructions:
          instructionsInput.value.trim(),

        image_url:
          imageUrl

      })
      .eq("id", recipeId)
      .eq("user_id", user.id);


    if (updateError) {

      console.log(updateError);

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: updateError.message
      });

      return;
    }


    // ================= DELETE OLD INGREDIENTS =================

    const {
      error: deleteIngredientsError
    } = await client
      .from("ingredients")
      .delete()
      .eq("recipe_id", recipeId);


    if (deleteIngredientsError) {

      console.log(
        deleteIngredientsError
      );

      Swal.fire({
        icon: "error",
        title: "Ingredients Error",
        text: deleteIngredientsError.message
      });

      return;
    }


    // ================= NEW INGREDIENTS =================

    const ingredientLines =
      ingredientsInput.value
        .split("\n")
        .map(item => item.trim())
        .filter(item => item !== "");


    // ================= INSERT INGREDIENTS =================

    if (ingredientLines.length > 0) {

      const newIngredients =
        ingredientLines.map(item => {

          /*
            Example:
            2 cups flour

            quantity = 2 cups
            ingredient_name = flour
          */

          const parts =
            item.split(" ");


          if (parts.length === 1) {

            return {

              recipe_id:
                Number(recipeId),

              ingredient_name:
                item,

              quantity:
                null

            };

          }


          const quantity =
            parts
              .slice(0, 2)
              .join(" ");


          const ingredientName =
            parts
              .slice(2)
              .join(" ");


          if (!ingredientName) {

            return {

              recipe_id:
                Number(recipeId),

              ingredient_name:
                item,

              quantity:
                null

            };

          }


          return {

            recipe_id:
              Number(recipeId),

            ingredient_name:
              ingredientName,

            quantity:
              quantity

          };

        });


      const {
        error: insertIngredientsError
      } = await client
        .from("ingredients")
        .insert(newIngredients);


      if (insertIngredientsError) {

        console.log(
          insertIngredientsError
        );

        Swal.fire({
          icon: "error",
          title: "Ingredients Error",
          text: insertIngredientsError.message
        });

        return;
      }

    }


    // ================= SUCCESS =================

    await Swal.fire({

      icon: "success",

      title: "Recipe Updated!",

      text:
        "Your recipe has been updated successfully.",

      confirmButtonColor:
        "#ffc107",

      timer: 1800,

      showConfirmButton: false

    });


    // ================= REFRESH =================

    getMyRecipes();

  }
);


// ================= DELETE RECIPE ======================

async function deleteRecipe(recipeId) {

  const result =
    await Swal.fire({

      title: "Delete Recipe?",

      text:
        "This recipe will be permanently deleted.",

      icon: "warning",

      showCancelButton: true,

      confirmButtonText:
        "Yes, Delete",

      cancelButtonText:
        "Cancel"

    });


  if (!result.isConfirmed) {
    return;
  }


  try {

    // ================= GET USER =================

    const {
      data: { user },
      error: userError
    } = await client.auth.getUser();


    if (userError || !user) {

      window.location.href =
        "login.html";

      return;
    }


    // ================= DELETE =================

    const {
      error
    } = await client
      .from("recipes")
      .delete()
      .eq("id", recipeId)
      .eq("user_id", user.id);


    if (error) {

      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error.message
      });

      return;
    }


    // ================= SUCCESS =================

    await Swal.fire({

      icon: "success",

      title: "Deleted!",

      text:
        "Recipe deleted successfully.",

      timer: 1500,

      showConfirmButton: false

    });


    // ================= RELOAD =================

    getMyRecipes();


  } catch (error) {

    console.log(error);

    Swal.fire({

      icon: "error",

      title: "Something Went Wrong",

      text: error.message

    });

  }

}

// ================= HTML ESCAPE ========================

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

// ================= INITIALIZE =========================

getUser();

getMyRecipes();