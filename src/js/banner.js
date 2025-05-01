function loadBanner() {
  const banner = document.getElementById('banner');
  const username=await getLoggedInUsername();
  
  const mainPage = document.createElement('a');
  mainPage.href = "index.html";
  mainPage.textContent = "Main Page";
  mainPage.setAttribute('align', 'center');
  banner.appendChild(mainPage);
  banner.appendChild(document.createTextNode(' '));
  
  const explore = document.createElement('a');
  explore.href = "explore.html";
  explore.textContent = "Explore";
  banner.appendChild(explore);
  banner.appendChild(document.createTextNode(' '));
  
  if(username==null){
    const loginLink = document.createElement('a');
    loginLink.href = "login.html";
    loginLink.textContent = "Log in";
    banner.appendChild(loginLink);
    banner.appendChild(document.createTextNode(' '));
    
    const signupLink = document.createElement('a');
    signupLink.href = "signup.html";
    signupLink.textContent = "Sign up";
    signupLink.id = "signup";
    banner.appendChild(signupLink);
  } else {
    const profile = document.createElement('a');
    profile.href = username;
    profile.textContent = username;
    banner.appendChild(profile);
    banner.appendChild(document.createTextNode(' '));
  }
}
document.addEventListener("DOMContentLoaded", loadBanner);

async function getLoggedInUsername() {
  const user = supabaseClient.auth.user();
  
  if (!user) {
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('User')
      .select('username')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching username:', error);
      return null;
    }

    return data.username || null; // Return the username or null if not found
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
}
