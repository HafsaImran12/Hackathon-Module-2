let logout = document.querySelector("#logoutBtn");

logout.addEventListener("click", async () => {

  const { error } = await client.auth.signOut();
  
  if (error) {
    console.log(error.message);
    return;
  }

  window.location.href = "../index.html";
});
