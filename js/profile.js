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

getUser();``