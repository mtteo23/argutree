const supabaseUrl = 'https://htbxgsolhsxacotnprjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0Ynhnc29saHN4YWNvdG5wcmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MzQ2MzAsImV4cCI6MjA1NzIxMDYzMH0.OJy9IdF8aWh_YuqU3WIdvuqAX-2GAfTTjMxu9zMAHMo';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function loadBanner() {
  const banner = document.getElementById('banner');
  const username=await getUsername();
  
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
  
  alert(username);
  
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

async function getUsername() {
	
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

  if (userError) {
    console.error('Error getting user:', userError.message);
		return null;
  }

	 if (!user) {
		console.log('No user logged in');
		return null;
  }

  const userId = user.id;
			
  const { data, error } = await supabaseClient
    .from('User')
		.select('username')
		.eq('user_id', userId)
		.single();

  if (error) {
    console.error('Error fetching username:', error.message);
		return null;
  }
  
	return data.username;
}
