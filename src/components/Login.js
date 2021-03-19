import React from "react";

export default function Login() {
  return (
    <div className="c-login-wrapper">
      <h3>Kambüüs</h3>
      <form method="post" action="login/">
        <label htmlFor="name">Nimi</label>
        <input type="text" id="name" name="username" required />
        <label htmlFor="password">Salsõna</label>
        <input type="password" id="password" name="password" required />
        <button className="c-btn">Sisene</button>
      </form>
    </div>
  );
}
