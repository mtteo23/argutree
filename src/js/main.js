window.onload = async function() {
	start();
}

async function start() {
  //document.getElementById('graph').innerHTML = '';
  document.getElementById('label').innerHTML = '';
  document.getElementById('error').textContent = '';
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
      const map = document.createElement('div');
      map.innerHTML='<div id="map"><div id="graph" align=center></div></div>';
      document.body.appendChild(map.firstChild);
      
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
        document.getElementById('label').appendChild(profileDiv);
      }
      else
      {						
        const profileDiv = document.createElement("div");
        profileDiv.className = "profile";
        const heading = document.createElement("h1");
        heading.innerHTML = 'Archive of <span id="username">'+username+'</span>';
        profileDiv.appendChild(heading);
        document.getElementById('label').appendChild(profileDiv);
      }
      const Projects= await getProjects(username)
      Projects.forEach(project => {
        // Create a container div for each project
        const projectContainer = document.createElement("div");
        projectContainer.classList.add("project-container");
        projectContainer.id=project.name;
        
        // Create the anchor element (button) for the project
        const projectLink = document.createElement("a");
        projectLink.textContent = project.name;
        projectLink.href = "/" + username + "/" + project.name;
        projectLink.classList.add("project-link");
        
        projectContainer.appendChild(projectLink);


        if(logged){
          // Create the delete button
          const deleteButton = document.createElement("button");
          deleteButton.textContent = "x";
          deleteButton.classList.add("delete-button-project");
          deleteButton.onclick = async function() {
              // Define your delete logic here
              const id= await getTreeId(project.name);
              deleteTree(id);
          };

          // Create the modify button
          const modifyButton = document.createElement("button");
          modifyButton.textContent = "Modify";
          modifyButton.classList.add("modify-button-project");
          modifyButton.onclick = async function() {
              renameTitle(project.name);
          };

          // Append the link, modify button, and delete button to the container
          
          projectContainer.appendChild(modifyButton);
          projectContainer.appendChild(deleteButton);
        }

        // Append the container to the 'graph' element
        document.getElementById('label').appendChild(projectContainer);
    });
    if(logged){
        const but=document.createElement("a");
        but.textContent='new project';
        but.classList.add("project-link");
        but.onclick=function (){insertTitle();};
        but.id="new-project";
        document.getElementById('label').appendChild(but);
      }
    }	
  }
  else
  {
    document.getElementById('label').innerHTML = '<div  id="explaination">Our world is increasingly trapped in echo chambers, and debates have become harder to conduct as we tie our identities to simplistic opinions about complex problems.This website aims to present intricate flows of thought—underlying both individual and collective opinions—in a simple and clear way. This approach helps us understand opposing views on political, ideological, and personal conflicts, making it easier to find solutions without misunderstandings or logical fallacies.</div>';
  }
}

async function createTree(name) {
    const { data, error } = await supabaseClient
        .rpc('create_tree_and_argument', {
            p_name: name
        });

    if (error) {
        console.error('Error creating tree and argument:', error);
    }
    return start();
}

async function getTreeId(name) {
  try {
    user= await getLoggedInUserId();
    const { data, error } = await supabaseClient
      .from('Tree')
      .select('id')
      .eq('user', user)
      .eq('name', name)
      .single(); // Assuming "name" and "user" uniquely identify a row
    
    if (error) throw error;
    if (!data) throw new Error('Tree not found');

    return data.id;
  } catch (error) {
    console.error('Error fetching tree ID:', error.message);
    return null;
  }
}

async function deleteDependentArgs(treeId) {
  const { data: treeData, error: treeError } = await supabaseClient
      .from('Tree')
      .select('head')
      .eq('id', treeId)
      .single(); 
  
  if (treeError || treeData==null) {
      console.log(treeData);
      console.error('Error fetching head ID:', treeError);
      return null;
  }
     
  const headId = parseInt(treeData.head, 10);
  
  const { data: argsData, error: headError } = await supabaseClient.rpc('get_argument_descendants', {
	  p_head_id: headId
	});

	if (headError) {
	  console.error("Error fetching descendants:", headError);
	} else {
	  //console.log("Descendants:", argsData);
	}
   
	for (const argument of argsData) {
    try {
      const { error: argError } = await supabaseClient
        .from('Argument')
        .delete()
        .eq('id', argument.id);

      if (argError) {
        console.error("Error deleting ArgId:", argument.id, argError.message);
      } else {
        console.log("Successfully deleted ArgId:", argument.id);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  }
  
	const { data: evData, error: evError } = await supabaseClient.rpc('get_evidence_for_argument_descendants', {
	  p_head_id: headId
	});
  
  if (evError) {
	  console.error("Error fetching evidence:", evError);
	} else {
	  //console.log("Evidence records:", evData);
	}
  
  for (const evidence of evData) {
    try {
      const { error } = await supabaseClient
        .from('Evidence')
        .delete()
        .eq('id', evidence.id);

      if (error) {
        console.error("Error deleting EvId:", evidence.id, error.message);
      } else {
        console.log("Successfully deleted EvId:", evidence.id);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  }
}

async function deleteTree(treeId) {
    try {
      //Delete all tree Args
      await deleteDependentArgs(treeId);
      
      // Delete the tree by ID
      const { error } = await supabaseClient
        .from('Tree')
        .delete()
        .eq('id', treeId);
      
      if (error) throw error;

    } catch (error) {
      console.error('Error deleting tree:', error.message);
  }
    return start();
}

async function modifyTree(id, newName) {
    //console.debug("modifyTree called with:", { id, newName }); // Log function inputs

  try {
    // Update the tree name
    const { data, error } = await supabaseClient
      .from('Tree')
      .update({ name: newName }) // Update the name column
      .eq('id', id);

    //console.debug("Supabase response:", { data, error }); // Log response from Supabase

    if (error) {
      console.error('Error updating tree name:', error.message);
      throw error; // Re-throw the error for external handling
    }

    //console.info("Tree updated successfully:", { id, newName, data });
  } catch (error) {
    console.error('Unexpected error in modifyTree:', error);
  }
  
    return start();
}



async function getLoggedInUserId() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();

        if (error) {
            console.error('Error fetching user:', error);
            return null;
        }

        if (!user) {
            console.log('No user is logged in');
            return null;
        }
        const uuid=user.id;
        if(uuid){
          
          const { data: userData, error: userError } = await supabaseClient
            .from('User')  
            .select('id')
            .eq('user_id', uuid)
            .single();
          return userData.id;
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        return null;
    }
}

async function noRepetition(title) {
  const errorDiv = document.getElementById('error');
      
  const { data: isAvailable, error } = await supabaseClient
    .rpc('check_project_title_available', { _user: await getLoggedInUserId(), _title: title});
      
  if (!isAvailable) {
    errorDiv.textContent = 'That name is already present.';
    return false;
  }
  return true;
}

function format(input) {
    
    input = String(input);
  
    let formatted = input.toLowerCase();

    formatted = formatted.replace(/\s+/g, '_');

    formatted = formatted.replace(/[^a-zA-Z0-9_-]/g, '');

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

    input.addEventListener('keydown', async function(event){
        if (event.key === 'Enter') {
            const tmp=format(input.value);
            
            if(await noRepetition(tmp) && limitSize(tmp))
              createTree(tmp);
        }
    });
}

function limitSize(title) {
  const errorDiv = document.getElementById('error');
    
  if(title.length==0 || title.length>30)
  {
    errorDiv.textContent = 'The name must be below 30 characters and not empty'; 
    return false;
  }
  return true;
}

async function renameTitle(name) {
    const button = document.getElementById(name);
    if (!button) {
        console.error(`Button with ID "${name}" not found.`);
        return;
    }

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter value here';
    input.style.marginLeft = '10px';

    button.parentNode.replaceChild(input, button);

    input.addEventListener('keydown', async function (event) {
        if (event.key === 'Enter') {
            const id = await getTreeId(name);
            const tmp=format(input.value);
            if(await noRepetition(tmp) && limitSize(tmp))
              modifyTree(id, tmp);
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
  
	return data.username;
}
