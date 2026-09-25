const recipeDetails = document.getElementById("recipeDetails");
// ================= GET RECIPE ID =================
const urlParams = new URLSearchParams(window.location.search);
const recipeId = urlParams.get("id");

// ================= LOAD PROFILE =================

async function loadProfile() {
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) {
    return;
  }

  // Get user name
  const { data: userData } = await client
    .from("users")
    .select("first_name, last_name")
    .eq("user_id", user.id)
    .single();

  if (userData) {
    const firstName = userData.first_name || "";
    const lastName = userData.last_name || "";

    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
      document.querySelector("#profileName").textContent = fullName;

      document.querySelector("#profileInitial").textContent = firstName
        .charAt(0)
        .toUpperCase();
    }
  }
}

// ================= GET RECIPE =================

async function getRecipeDetails() {
  if (!recipeId) {
    showError("Recipe ID is missing.");

    return;
  }

  try {
    // Get recipe
    const { data: recipe, error: recipeError } = await client

      .from("recipes")

      .select(
        `
          id,
          title,
          description,
          instructions,
          cooking_time,
          image_url,
          created_at,
          category (
            name
          )
        `,
      )

      .eq("id", recipeId)

      .single();

    if (recipeError) {
      console.log(recipeError);

      showError(recipeError.message);

      return;
    }

    // Get ingredients
    const { data: ingredients, error: ingredientError } = await client

      .from("ingredients")

      .select(
        `
          id,
          ingredient_name,
          quantity
        `,
      )

      .eq("recipe_id", recipeId);

    if (ingredientError) {
      console.log(ingredientError);
    }

    displayRecipe(recipe, ingredients || []);
  } catch (error) {
    console.log(error);

    showError(error.message);
  }
}

// ================= DISPLAY RECIPE =================

function displayRecipe(recipe, ingredients) {
  const date = new Date(recipe.created_at).toLocaleDateString();

  // Ingredients
  let ingredientsHTML = "";

  if (ingredients.length > 0) {
    ingredientsHTML = ingredients
      .map((item) => {
        return `

          <div class="ingredient-item">
            <i class="fa-solid fa-check me-2"></i>
            <span>
              ${item.quantity ? `${item.quantity} ` : ""}
              ${item.ingredient_name}
            </span>
          </div>
        `;
      })
      .join("");
  } else {
    ingredientsHTML = `
      <p class="text-muted">
        No ingredients added.
      </p>
    `;
  }

  // Image
  let imageHTML = "";
  if (recipe.image_url) {
    imageHTML = `
      <img
        src="${recipe.image_url}"
        alt="${recipe.title}"
        class="recipe-image"
      >
    `;
  } else {
    imageHTML = `
      <div class="image-placeholder">
        <i class="fa-solid fa-utensils fa-5x"></i>
      </div>
    `;
  }

  // Main HTML
  recipeDetails.innerHTML = `
    <!-- Back -->
    <a
      href="./dashboard.html"
      class="back-link"
    >
      <i class="fa-solid fa-arrow-left me-2"></i>
      Back to Recipes
    </a>

  <!-- Recipe Card -->

    <div class="recipe-card">

      <!-- Top -->

      <div class="row g-4">

        <!-- Image -->

        <div class="col-lg-6">
          ${imageHTML}
        </div>

        <!-- Info -->

        <div class="col-lg-6 d-flex flex-column justify-content-center">

          <!-- Category -->

          <span class="category-badge align-self-start">
            ${recipe.category?.name || "Uncategorized"}
          </span>

          <!-- Title -->

          <h1 class="recipe-title">
          ${recipe.title}
          </h1>

          <!-- Description -->

          <p class="recipe-description">
            ${recipe.description || "No description available."}
          </p>


          <!-- Cooking Time -->

          <div class="recipe-info">
            <div class="info-icon">
              <i class="fa-regular fa-clock"></i>
            </div>
            <div class="info-text">
              <small>
                Cooking Time
              </small>
              <strong>
                ${recipe.cooking_time || 0}
                minutes
              </strong>
            </div>
          </div>

          <!-- Date -->

          <div class="recipe-info">
            <div class="info-icon">
            <i class="fa-regular fa-calendar"></i>
            </div>
            <div class="info-text">
              <small>
                Added On
              </small>
              <strong>
                ${date}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <hr class="my-5">

      <!-- Ingredients -->

      <div class="mb-5">
        <h2 class="section-title">
          <i class="fa-solid fa-basket-shopping me-2"></i>
          Ingredients
        </h2>
        <div class="row">
          <div class="col-lg-8">
            ${ingredientsHTML}
          </div>
        </div>
      </div>


      <!-- Instructions -->

      <div>
        <h2 class="section-title">
          <i class="fa-solid fa-list-check me-2"></i>
          Instructions
        </h2>
        <div class="instructions-box">
          ${recipe.instructions || "No instructions available."}
        </div>
      </div>
    </div>

  `;
}

// ================= ERROR =================

function showError(message) {
  recipeDetails.innerHTML = `

    <div class="text-center py-5">
      <i
        class="fa-solid fa-circle-exclamation text-danger"
        style="font-size:60px;"
      ></i>
      <h3 class="mt-4">
        Recipe Not Found
      </h3>
      <p class="text-muted">
        ${message}
      </p>
      <a
        href="./browse.html"
        class="btn btn-warning mt-2"
      >
        <i class="fa-solid fa-arrow-left me-2"></i>
        Back to Recipes
      </a>
    </div>
  `;
}

// ================= START =================

loadProfile();
getRecipeDetails();
