document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');

    // Fetch the code.txt file
    fetch('code.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch code.txt: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            const rows = data.split('\n'); // Split the file content by lines

            rows.forEach((row, index) => {
                const p = document.createElement('p');
                p.id = `line-${index + 1}`; // Assign a unique id
                p.textContent = row; // Set the text content
                contentDiv.appendChild(p); // Append to the container
            });
        })
        .catch(error => {
            console.error('Error loading the code.txt file:', error);
        });
});

