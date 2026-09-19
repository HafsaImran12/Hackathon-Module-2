const signupBtn = document.querySelector("#signupBtn")
const signupForm = document.querySelector("#signupForm")

signupBtn.addEventListener("click", async (event) => {
    event.preventDefault()

    try {

        console.log("signup");

        // insert user info
        const { error } = await user
            .from('user_data')
            .insert({ id: 1, name: 'Mordor' })

        // signup user
        const { data, error } = await supabase.auth.signUp({
            email: 'example@email.com',
            password: 'example-password',
        })

    } catch (error) {
        console.log(error);
    }

})