let profileName = document.querySelector("#profileName");
let profileInitial = document.querySelector("#profileInitial");
let myRecipes = document.querySelector("#myRecipes");

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



async function recipe() {
    console.log("recipe");
    
}

recipe()