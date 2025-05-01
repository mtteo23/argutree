function loadBanner() {
    const banner = `
        <div id="banner">
            <a href="index.html" align="center">Main Page</a>
            <a href="explore.html">Explore</a>
            <a href="login.html">Log in</a>
            <a id="signup" href="signup.html">Sign up</a>
        </div>
    `;
    document.getElementById("banner").innerHTML = banner;
}
document.addEventListener("DOMContentLoaded", banner);
