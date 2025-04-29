const supabaseUrl = 'https://htbxgsolhsxacotnprjq.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0Ynhnc29saHN4YWNvdG5wcmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MzQ2MzAsImV4cCI6MjA1NzIxMDYzMH0.OJy9IdF8aWh_YuqU3WIdvuqAX-2GAfTTjMxu9zMAHMo'; // Replace with your Supabase Anon Key
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
  
window.onload = async function() {
	const pathParts = window.location.pathname.split('/').filter(Boolean);
	const username = pathParts[0] || "#no-user#";
	const project = pathParts[1] || "#no-project#";
  
	if(username!="#no-user#")
	{
		let logged=false;
		if(username == await getUsername()){
			logged=true;
		}
		else{
			logged=false;
		}
    if(project!="#no-project#")
    {
      const script = document.createElement('script');
      script.src = '/src/js/graph.js';
      script.onload = () => {
        if (typeof drawGraph === 'function') {
          if(logged)
            drawGraph(username, project, "modify");
          else
            drawGraph(username, project, "watch");
        }
      };
      document.head.appendChild(script);
    }
    else
    {
      if(logged)
      {
        const profileDiv = document.createElement("div");
        profileDiv.className = "profile";
        const heading = document.createElement("h1");
        heading.innerHTML = 'Welcome <span id="username">'+username+'</span>';
        profileDiv.appendChild(heading);
        document.body.appendChild(profileDiv);
      }
      else
      {						
        const profileDiv = document.createElement("div");
        profileDiv.className = "profile";
        const heading = document.createElement("h1");
        heading.innerHTML = 'Archive of <span id="username">'+username+'</span>';
        profileDiv.appendChild(heading);
        document.body.appendChild(profileDiv);
      }
      const Projects= await getProjects(username)
      Projects.forEach(project=>{
        const but=document.createElement("a");
        but.textContent=project.name;
        but.href="/"+username+"/"+project.name;
        but.classList.add("project-link");
        document.body.appendChild(but);
      });
      const but=document.createElement("a");
      but.textContent='new project';
      but.classList.add("project-link");
      but.onclick=insertTitle();
      but.id="new-project";
      document.body.appendChild(but);
    }	
  }
}

async function createTree(){
  try {
        userId=getLoggedInUserId();
        const { data, error } = await supabaseClient
            .from('Tree') // Replace 'Tree' with your table name
            .insert([
                { 
                    name: "new-project", 
                    user: userId, 
                    head: 15//await createHeadArgument()
                }
            ]);
        
        if (error) {
            console.error('Error inserting into Tree table:', error);
        } else {
            console.log('New Tree element added:', data);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

async function getLoggedInUserId() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();

        if (error) {
            console.error('Error fetching user:', error);
            return null;
        }

        if (user) {
            console.log('Logged-in user ID:', user.id);
            return user.id;
        } else {
            console.log('No user is logged in');
            return null;
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        return null;
    }
}

function format(input) {
    let formatted = input.toLowerCase();

    formatted = formatted.replace(/\s+/g, '_');

    formatted = formatted.replace(/[^a-z0-9_]/g, '');

    if (formatted.length > 30) {
        const words = formatted.split('_');
        let shortened = '';
        for (let word of words) {
            if ((shortened + '_' + word).length > 30) {
                break;
            }
            shortened += (shortened ? '_' : '') + word;
        }
        formatted = shortened;
    }

    return formatted;
}

async function insertTitle() {
    const buttonId="new-project";
    const button = document.getElementById(buttonId);
    if (!button) {
        console.error(`Button with ID "${buttonId}" not found.`);
        return;
    }

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter value here';
    input.style.marginLeft = '10px';

    button.parentNode.replaceChild(input, button);

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            createTree(format(input.value));
        }
    });
}
async function getProjects(username) {
	     
	const { data: userData, error: userError } = await supabaseClient
    .from('User')  
		.select('id')
    .eq('username', username)
		.single();
			
	if (userError || !userData) {
		console.error('Error fetching user ID:', userError);
		return null;
	}

	const userId = parseInt(userData.id, 10);
	
	const { data: treeData, error: treeError } = await supabaseClient
		.from('Tree')
		.select('name')
		.eq('user', userId);
		
	console.log("tree", treeData);
		
	return treeData;
}
		
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

	console.log('Username:', data.username);
	return data.username;
}
