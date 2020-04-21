const signUp = async (data) => {
  try {
    data["returnSecureToken"] = true;
    const res = await fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAXyzG4b-mwV8o56iNZNMcA470cJUCNCsA",
      {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(data),
      }
    );
    return await res.json();
  } catch (er) {
    console.log(er);
  }
};

const signIn = async (data) => {
  try {
    data["returnSecureToken"] = true;
    const res = await fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAXyzG4b-mwV8o56iNZNMcA470cJUCNCsA",
      {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(data),
      }
    );
    return await res.json();
  } catch (er) {
    console.log(er);
  }
};
document.getElementById("signup_btn").addEventListener("click", (e) => {
  console.log(e.target);
  const el = document.getElementById("submit_btn");
  if (e.target.innerHTML === "SIGNUP") {
    e.target.innerHTML = "SIGNIN";
    el.innerHTML = "SIGNUP";
  } else {
    e.target.innerHTML = "SIGNUP";
    el.innerHTML = "Login";
  }
});

// document.getElementById('submit_btn').addEventListener('click',e => {
// 	if(e.target.innerHTML === 'Login'){

// 	}
// })
("use strict");
$(function () {
  $("input[type='password'][data-eye]").each(function (i) {
    var $this = $(this),
      id = "eye-password-" + i,
      el = $("#" + id);

    $this.wrap(
      $("<div/>", {
        style: "position:relative",
        id: id,
      })
    );

    $this.css({
      paddingRight: 60,
    });
    $this.after(
      $("<div/>", {
        html: "Show",
        class: "btn btn-primary btn-sm",
        id: "passeye-toggle-" + i,
      }).css({
        position: "absolute",
        right: 10,
        top: $this.outerHeight() / 2 - 12,
        padding: "2px 7px",
        fontSize: 12,
        cursor: "pointer",
      })
    );

    $this.after(
      $("<input/>", {
        type: "hidden",
        id: "passeye-" + i,
      })
    );

    var invalid_feedback = $this.parent().parent().find(".invalid-feedback");

    if (invalid_feedback.length) {
      $this.after(invalid_feedback.clone());
    }

    $this.on("keyup paste", function () {
      $("#passeye-" + i).val($(this).val());
    });
    $("#passeye-toggle-" + i).on("click", function () {
      if ($this.hasClass("show")) {
        $this.attr("type", "password");
        $this.removeClass("show");
        $(this).removeClass("btn-outline-primary");
      } else {
        $this.attr("type", "text");
        $this.val($("#passeye-" + i).val());
        $this.addClass("show");
        $(this).addClass("btn-outline-primary");
      }
    });
  });

  $(".my-login-validation").submit(async function () {
    var form = $(this);
    if (form[0].checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    form.addClass("was-validated");
    event.preventDefault();
    console.log("clicked");
    const data = {};
    data.email = document.getElementById("email").value;
    data.password = document.getElementById("password").value;
    try {
      if (document.getElementById("submit_btn").innerHTML === "SIGNUP") {
        const res = await signUp(data);
        if (res.error) {
          return alert(res.error.message);
        }
        localStorage.setItem("auth_token", res.idToken);
        localStorage.setItem("userId", res.localId);
        console.log(res);
      } else {
        const res = await signIn(data);
        // console.log(res)
        if (res.error) {
          return alert(res.error.message);
        }
        localStorage.setItem("auth_token", res.idToken);
        localStorage.setItem("userId", res.localId);
      }
      window.location = "/";
    } catch (er) {
      console.log(er);
    }
  });
});
