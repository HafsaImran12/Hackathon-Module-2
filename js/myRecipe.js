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
        return
    }
}

getUser();



const myRecipes = document.getElementById("myRecipes");

// ================= GET MY RECIPES =================

async function getMyRecipes() {

  try {

    // Logged-in user
    const {
      data: { user },
      error: userError
    } = await client.auth.getUser();

    if (userError || !user) {
      window.location.href = "login.html";
      return;
    }

    // Get recipes
const { data, error } = await client
  .from("recipes")
  .select(`
    id,
    title,
    description,
    cooking_time,
    image_url,
    created_at,
    category_id,
    category (
      name
    )
  `)
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });

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

  if (!recipes || recipes.length === 0) {

    myRecipes.innerHTML = `
      <div class="col-12 text-center py-5">

        <i class="fa-solid fa-utensils fa-3x text-muted mb-3"></i>

        <h4>No Recipes Yet</h4>

        <p class="text-muted">
          You haven't created any recipes yet.
        </p>

        <a href="addRecipe.html" class="btn btn-warning">
          <i class="fa-solid fa-plus me-2"></i>
          Add Recipe
        </a>

      </div>
    `;

    return;
  }


  recipes.forEach(recipe => {

    const date = new Date(recipe.created_at)
      .toLocaleDateString();


    myRecipes.innerHTML += `

      <div class="col-md-6 col-lg-4 mb-4">

        <div class="card h-100 shadow-sm border-0">

          <!-- Image -->

          <div style="height:220px; overflow:hidden;">

            ${
              recipe.image_url

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
                class="w-100 h-100 d-flex
                align-items-center justify-content-center
                bg-light"
              >

                <i class="fa-solid fa-utensils fa-3x text-muted"></i>

              </div>
              `
            }

          </div>


          <!-- Card Body -->

          <div class="card-body">

            <!-- Category -->

            <span class="badge bg-warning text-dark mb-2">

              ${recipe.category?.name || "Uncategorized"}

            </span>


            <!-- Title -->

            <h5 class="card-title fw-bold">

              ${recipe.title}

            </h5>


            <!-- Description -->

            <p class="card-text text-muted">

              ${
                recipe.description?.length > 100

                ? recipe.description.substring(0, 100) + "..."

                : recipe.description
              }

            </p>


            <!-- Info -->

            <div
              class="d-flex justify-content-between
              text-muted small mb-3"
            >

              <span>

                <i class="fa-regular fa-clock me-1"></i>

                ${recipe.cooking_time} mins

              </span>


              <span>

                <i class="fa-regular fa-calendar me-1"></i>

                ${date}

              </span>

            </div>


            <!-- Buttons -->

            <div class="d-flex gap-2">

              <a
                href="recipeDetails.html?id=${recipe.id}"
                class="btn btn-outline-dark btn-sm flex-grow-1"
              >

                <i class="fa-solid fa-eye me-1"></i>

                View

              </a>


              <a
                href="editRecipe.html?id=${recipe.id}"
                class="btn btn-outline-warning btn-sm"
              >

                <i class="fa-solid fa-pen"></i>

              </a>


              <button
  class="btn btn-outline-danger btn-sm"
  onclick="deleteRecipe(${recipe.id})"
>
  <i class="fa-solid fa-trash"></i>
</button>

            </div>

          </div>

        </div>

      </div>

    `;

  });

}


// ================= RUN =================

getMyRecipes();

// ================= DELETE RECIPE =================

async function deleteRecipe(recipeId) {

  const result = await Swal.fire({
    title: "Delete Recipe?",
    text: "This recipe will be permanently deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete",
    cancelButtonText: "Cancel"
  });

  if (!result.isConfirmed) {
    return;
  }

  try {

    // Get logged-in user
    const {
      data: { user },
      error: userError
    } = await client.auth.getUser();

    if (userError || !user) {
      window.location.href = "login.html";
      return;
    }

    // Delete only user's own recipe
    const { error } = await client
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

    // Success
    await Swal.fire({
      icon: "success",
      title: "Deleted!",
      text: "Recipe deleted successfully.",
      timer: 1500,
      showConfirmButton: false
    });

    // Reload recipes
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