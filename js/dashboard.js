// ================= PROFILE =================

let profileName = document.querySelector("#profileName");
let profileInitial = document.querySelector("#profileInitial");
let userName = document.querySelector("#userName");


// ================= GET USER =================

async function getUser() {

  const {
    data: { user },
    error: userError
  } = await client.auth.getUser();


  if (userError || !user) {
    window.location.href = "login.html";
    return null;
  }


  console.log("Logged in user:", user);


  // Get user profile

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

    const firstName = data.first_name || "";
    const lastName = data.last_name || "";

    const fullName =
      `${firstName} ${lastName}`.trim();


    // Navbar name

    if (profileName) {
      profileName.innerHTML =
        fullName || "User";
    }


    // Profile initials

    if (profileInitial) {
      profileInitial.innerHTML =
        `${firstName.charAt(0)}${lastName.charAt(0)}`
        .toUpperCase();
    }

    userName.innerHTML = fullName


    // Welcome name

    if (userName) {
      userName.innerHTML =
        firstName || "User";
    }

  }


  return user;
}


// ================= TOTAL RECIPES =================

async function getTotalRecipes() {

  const {
    count,
    error
  } = await client
    .from("recipes")
    .select("*", {
      count: "exact",
      head: true
    });


  if (error) {

    console.log(
      "Total recipes error:",
      error.message
    );

    return;
  }


  document.querySelector(
    "#totalRecipes"
  ).innerHTML = count || 0;

}


// ================= MY RECIPES =================

async function getMyRecipesCount() {

  const {
    data: { user },
    error: userError
  } = await client.auth.getUser();


  if (userError || !user) {
    return;
  }


  const {
    count,
    error
  } = await client
    .from("recipes")
    .select("*", {
      count: "exact",
      head: true
    })
    .eq("user_id", user.id);


  if (error) {

    console.log(
      "My recipes error:",
      error.message
    );

    return;
  }


  document.querySelector(
    "#myRecipesCount"
  ).innerHTML = count || 0;

}


// ================= CATEGORIES =================

async function getCategoriesCount() {

  const {
    count,
    error
  } = await client
    .from("category")
    .select("*", {
      count: "exact",
      head: true
    });


  if (error) {

    console.log(
      "Categories error:",
      error.message
    );

    return;
  }


  // Aapke HTML mein Categories ka koi id nahi hai,
  // is liye us h3 ko id deni hogi.

  const categoryCount =
    document.querySelector(
      "#categoriesCount"
    );


  if (categoryCount) {
    categoryCount.innerHTML =
      count || 0;
  }

}


// ================= RECENT RECIPES =================

async function getRecentRecipes() {

  const {
    data: { user },
    error: userError
  } = await client.auth.getUser();


  if (userError || !user) {
    return;
  }


  const {
    data,
    error
  } = await client
    .from("recipes")
    .select(`
      id,
      title,
      cooking_time,
      image_url,
      created_at,
      category (
        name
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false
    })
    .limit(4);


  if (error) {

    console.log(
      "Recent recipes error:",
      error.message
    );

    return;
  }


  console.log(
    "Recent recipes:",
    data
  );


  displayRecentRecipes(data);

}


// ================= DISPLAY RECENT RECIPES =================

function displayRecentRecipes(recipes) {

  const recentRecipes =
    document.querySelector(
      "#recentRecipes"
    );


  if (!recentRecipes) {
    return;
  }


  recentRecipes.innerHTML = "";


  // No recipes

  if (
    !recipes ||
    recipes.length === 0
  ) {

    recentRecipes.innerHTML = `

      <div class="col-12">

        <div class="text-center py-5">

          <i
            class="fa-solid fa-utensils fa-3x text-muted mb-3"
          ></i>

          <h5>
            No Recipes Yet
          </h5>

          <p class="text-muted">
            You haven't created any recipes yet.
          </p>

          <a
            href="addRecipe.html"
            class="btn add-recipe-btn"
          >
            <i class="fa-solid fa-plus me-2"></i>
            Add Recipe
          </a>

        </div>

      </div>

    `;

    return;
  }


  // Display recipes

  recipes.forEach((recipe) => {

    const date =
      new Date(
        recipe.created_at
      ).toLocaleDateString();


    recentRecipes.innerHTML += `

      <div class="col-sm-6 col-lg-3">

        <div class="recipe-card">

          <div class="recipe-image">

            ${
              recipe.image_url

              ?

              `
                <img
                  src="${recipe.image_url}"
                  alt="${recipe.title}"
                />
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


            <span class="category-badge">

              ${
                recipe.category?.name ||
                "Uncategorized"
              }

            </span>


            <button
              class="favorite-btn"
              type="button"
            >

              <i
                class="fa-regular fa-heart"
              ></i>

            </button>

          </div>


          <div class="recipe-body">

            <h5>
              ${recipe.title}
            </h5>


            <div class="recipe-info">

              <span>

                <i
                  class="fa-regular fa-clock"
                ></i>

                ${recipe.cooking_time}
                mins

              </span>


              <span>

                <i
                  class="fa-solid fa-calendar"
                ></i>

                ${date}

              </span>

            </div>


            <a
              href="recipeDetails.html?id=${recipe.id}"
              class="btn btn-sm btn-outline-dark mt-3 w-100"
            >

              <i
                class="fa-solid fa-eye me-1"
              ></i>

              View Recipe

            </a>

          </div>

        </div>

      </div>

    `;

  });

}


// ================= FAVORITES =================

// Abhi Favorites functionality/table nahi hai,
// isliye static value 8 rahegi.


// ================= LOGOUT =================

const logoutBtn =
  document.querySelector(
    "#logoutBtn"
  );


if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      const result =
        await Swal.fire({

          title: "Logout?",

          text:
            "Are you sure you want to logout?",

          icon: "question",

          showCancelButton: true,

          confirmButtonText:
            "Yes, Logout",

          cancelButtonText:
            "Cancel"

        });


      if (!result.isConfirmed) {
        return;
      }


      const {
        error
      } = await client.auth.signOut();


      if (error) {

        Swal.fire({

          icon: "error",

          title: "Logout Failed",

          text: error.message

        });

        return;
      }


      window.location.href =
        "login.html";

    }
  );

}


// ================= INITIALIZE =================

async function dashboard() {

  await getUser();

  await getTotalRecipes();

  await getMyRecipesCount();

  await getCategoriesCount();

  await getRecentRecipes();

}


dashboard();