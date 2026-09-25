let firstName = document.querySelector("#firstName");
let lastName = document.querySelector("#lastName");
let email = document.querySelector("#email");
let userEmail = document.querySelector("#userEmail");
let userName = document.querySelector("#userName");
let userInitials = document.querySelector("#userInitials");
let profileInitial = document.querySelector("#profileInitial");

async function getUser() {
  console.log("getuser");

  // get user
  const {
    data: { user },
  } = await client.auth.getUser();

  console.log((email.value = user.email));
  userEmail.innerHTML = user.email;
  email.innerHTML = user.email;

  // select user name
  const { data, error } = await client
    .from("user_data")
    .select("first_name, last_name")
    .eq("user_id", user.id);

  firstName.innerHTML = data[0].first_name;
  lastName.innerHTML = data[0].last_name;
  userName.innerHTML = `${data[0].first_name} ${data[0].last_name}`;

  userInitials.innerHTML = `${data[0].first_name[0]}${data[0].last_name[0]}`;

  if (error) {
    console.log(error.message);
    return;
  }
}

getUser();

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

getTotalRecipes()


// ================= MY RECIPES COUNT =================

async function getMyRecipesCount() {

  // Get logged-in user
  const {
    data: { user },
    error: userError
  } = await client.auth.getUser();

  if (userError || !user) {
    console.log("User not found");
    return;
  }

  // Count user's recipes
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
    console.log("My Recipes Count Error:", error.message);
    return;
  }

  // Show count in HTML
  const myRecipesCount = document.querySelector("#myRecipesCount");

  if (myRecipesCount) {
    myRecipesCount.innerHTML = count || 0;
  }
}
getMyRecipesCount()