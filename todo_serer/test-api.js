// Simple API test script
const API_BASE = process.env.API_URL || 'http://localhost:3001/api';

async function testAPI() {
  try {
    console.log('Testing Todo Manager API...\n');
    
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await fetch(`${API_BASE}/health`);
    console.log('Health:', await health.json());
    
    // Test create group
    console.log('\n2. Creating a test group...');
    const groupResponse = await fetch(`${API_BASE}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Project', discussion: 'Test discussion' })
    });
    const group = await groupResponse.json();
    console.log('Created group:', group);
    
    if (group.success) {
      const groupId = group.data._id;
      
      // Test create task
      console.log('\n3. Creating a test task...');
      const taskResponse = await fetch(`${API_BASE}/groups/${groupId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: 'Test Task', 
          description: 'Test description',
          startDate: '2024-01-15',
          endDate: '2024-01-20'
        })
      });
      const task = await taskResponse.json();
      console.log('Created task:', task);
      
      if (task.success) {
        const taskId = task.data._id;
        
        // Test update task status
        console.log('\n4. Updating task status...');
        const statusResponse = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'In Progress' })
        });
        const updatedTask = await statusResponse.json();
        console.log('Updated task:', updatedTask);
        
        // Test add comment
        console.log('\n5. Adding a comment...');
        const commentResponse = await fetch(`${API_BASE}/tasks/${taskId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'This is a test comment' })
        });
        const comment = await commentResponse.json();
        console.log('Added comment:', comment);
      }
    }
    
    // Test get all groups
    console.log('\n6. Getting all groups...');
    const allGroups = await fetch(`${API_BASE}/groups`);
    console.log('All groups:', await allGroups.json());
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run tests if server is running
testAPI();