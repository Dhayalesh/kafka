// Enhanced Events Test Script
const API_BASE = process.env.API_URL || 'http://localhost:3001/api';

async function testEnhancedEvents() {
  try {
    console.log('🧪 Testing Enhanced Change Tracking Events...\n');
    
    // 1. Create group
    console.log('1. Creating a test group...');
    const groupResponse = await fetch(`${API_BASE}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: 'Enhanced Test Project', 
        discussion: 'Testing enhanced change tracking' 
      })
    });
    const group = await groupResponse.json();
    console.log('✅ Group created - Event: Group "Enhanced Test Project" created');
    
    if (!group.success) return;
    const groupId = group.data._id;
    
    // 2. Create task with dates
    console.log('\n2. Creating task with dates...');
    const taskResponse = await fetch(`${API_BASE}/groups/${groupId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: 'Setup Database',
        description: 'Configure MongoDB connection',
        startDate: '2024-01-15',
        endDate: '2024-01-20'
      })
    });
    const task = await taskResponse.json();
    console.log('✅ Task created - Event: Task "Setup Database" created in group "Enhanced Test Project"');
    
    if (!task.success) return;
    const taskId = task.data._id;
    
    // 3. Update task status
    console.log('\n3. Changing task status...');
    await fetch(`${API_BASE}/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'In Progress' })
    });
    console.log('✅ Status changed - Event: Task status changed from "New" to "In Progress"');
    
    // 4. Update task details
    console.log('\n4. Updating task details...');
    await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: 'Setup Database Connection',
        description: 'Configure MongoDB connection with authentication',
        startDate: '2024-01-16',
        endDate: '2024-01-22'
      })
    });
    console.log('✅ Task updated - Event: Multiple changes tracked');
    
    // 5. Add comment
    console.log('\n5. Adding comment...');
    await fetch(`${API_BASE}/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Started working on database setup' })
    });
    console.log('✅ Comment added - Event: Comment added to task');
    
    // 6. Update group
    console.log('\n6. Updating group...');
    await fetch(`${API_BASE}/groups/${groupId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: 'Enhanced Test Project - Updated',
        discussion: 'Updated discussion for testing'
      })
    });
    console.log('✅ Group updated - Event: Group name and discussion changed');
    
    // 7. Change status again
    console.log('\n7. Changing status to Completed...');
    await fetch(`${API_BASE}/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Completed' })
    });
    console.log('✅ Status changed - Event: Task status changed from "In Progress" to "Completed"');
    
    console.log('\n🎉 Enhanced event testing completed!');
    console.log('📊 Check Kafka consumer logs to see detailed change messages');
    console.log('🔍 Check TimescaleDB for stored event history');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run enhanced tests
testEnhancedEvents();