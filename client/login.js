function emailValidate(email)
{
    const validateEmail = (email) => {
    return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
    }
    return validateEmail(email) !== null;
}

const form_listener = document.getElementById("form_login")
form_listener.addEventListener('submit', function(e)
{
    e.preventDefault()
    const email = document.getElementById("username").value
    if(!emailValidate(email))
    {
        alert('Email is not valid!')
    }
    else
    {
        const pass = document.getElementById("password").value
        if(pass.length < 6)
        {
            alert('Password is to short!')
            console.log('Password is to short!');
        }
        else
        {
            window.location.href = "HomePage.html"
        }
    }
}) 




// var pass = document.getElementById('password');
// //check if the password length is okay
// pass.addEventListener('input', function(e){
//     e.preventDefault()
//     var passValue = pass.value;
//     console.log(passValue)
//     if(passValue.length < 6)
//     {
//         alert('Password is to short!');
//         console.log('Password is to short!');
//     }
//     else
//     {
//         alert('Password is okay')
//         console.log('Password is to short!');

//     }
// });

