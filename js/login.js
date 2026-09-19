const loginBtn = document.querySelector("#loginBtn")
const email = document.querySelector("#email")
const password = document.querySelector("#password")

loginBtn.addEventListener("click", async (event) => {

    event.preventDefault()

    try {


    
    const { data, error } = await supabase.auth.signInWithPassword({
  email: email.value,
  password:password.value,
})

} catch (error) {
    console.log(error);
    
}

})