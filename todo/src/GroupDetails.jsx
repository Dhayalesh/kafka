import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTodo } from './TodoContext'
import EditTaskModal from './components/EditTaskModal'
import todoService from './api/todoService.js'

const STATUSES = ['New', 'Backlog', 'In Progress', 'Completed', 'Approved']
const STATUS_COLORS = {
  'New': 'status-new',
  'Backlog': 'status-backlog',
  'In Progress': 'status-progress',
  'Completed': 'status-completed',
  'Approved': 'status-approved'
}

function GroupDetails() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { groups, addTask, updateTask, deleteTask, updateTaskStatus, addComment, getGroupLogs, getSnapshots, restoreSnapshot } = useTodo()
  
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskStartDate, setNewTaskStartDate] = useState('')
  const [newTaskEndDate, setNewTaskEndDate] = useState('')
  const [openStatusPicker, setOpenStatusPicker] = useState(null)
  const [newComment, setNewComment] = useState({})
  const [showComments, setShowComments] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [logs, setLogs] = useState([])
  const [showLogs, setShowLogs] = useState(false)
  const [snapshots, setSnapshots] = useState([])
  const [taskHistory, setTaskHistory] = useState({})
  const [showTaskHistory, setShowTaskHistory] = useState(null)

  const [detailedGroup, setDetailedGroup] = useState(null)
  
  const group = groups.find(g => g._id === groupId)

  if (!group) {
    return (
      <div className="container">
        <div className="max-width">
          <h1 className="title">Group not found</h1>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Groups
          </button>
        </div>
      </div>
    )
  }

  const handleAddTask = async () => {
    if (newTaskName.trim()) {
      const result = await addTask(group._id, {
        name: newTaskName,
        description: newTaskDescription,
        startDate: newTaskStartDate,
        endDate: newTaskEndDate
      })
      if (result.success) {
        setNewTaskName('')
        setNewTaskDescription('')
        setNewTaskStartDate('')
        setNewTaskEndDate('')
        setShowTaskForm(false)
      } else {
        alert(`Failed to create task: ${result.error?.message || 'Unknown error'}`)
        if (result.error?.code === 'NOT_FOUND') {
          navigate('/')
        }
      }
    }
  }

  const handleAddComment = async (taskId) => {
    const commentText = newComment[taskId] || ''
    if (commentText.trim()) {
      const result = await addComment(taskId, commentText)
      if (result.success) {
        setNewComment(prev => ({ ...prev, [taskId]: '' }))
      }
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
  }

  const handleSaveTask = async (taskData) => {
    const result = await updateTask(editingTask._id, taskData)
    if (result.success) {
      setEditingTask(null)
    }
  }

  const loadLogs = async () => {
    const result = await getGroupLogs(groupId)
    if (result.success) {
      setLogs(result.data)
    }
  }

  const loadSnapshots = async () => {
    const result = await getSnapshots()
    if (result.success) {
      setSnapshots(result.snapshots)
    }
  }

  const loadTaskHistory = async (taskId) => {
    const result = await todoService.getTaskLogs(taskId)
    if (result.success) {
      setTaskHistory(prev => ({ ...prev, [taskId]: result.data }))
    }
  }

  const handleRestoreSnapshot = async (snapshotId) => {
    if (window.confirm('Are you sure you want to restore to this version? Current data will be replaced.')) {
      const result = await restoreSnapshot(snapshotId)
      if (result.success) {
        alert('Database restored successfully!')
        window.location.reload()
      } else {
        alert('Restore failed: ' + result.error)
      }
    }
  }

  useEffect(() => {
    if (showLogs) {
      loadLogs()
      loadSnapshots()
    }
  }, [showLogs, groupId])

  // Load detailed group (tasks with populated comments) so comments have text/timestamp
  useEffect(() => {
    let mounted = true
    const loadDetailed = async () => {
      try {
        const result = await todoService.getGroup(groupId)
        if (mounted && result && result.success) {
          setDetailedGroup(result.data)
        }
      } catch (err) {
        // ignore - fallback to groups from context
      }
    }
    if (group) {
      loadDetailed()
    }
    return () => { mounted = false }
  }, [groupId, group])

  return (
    <div className="container">
      <div className="max-width">
        <div className="group-header">
          <button onClick={() => navigate('/')} className="btn btn-secondary back-btn">
            ← Back to Groups
          </button>
          <h1 className="title">{group.name}</h1>
        </div>
        
        {group.discussion && (
          <div className="group-discussion-detail">
            <h3>Discussion</h3>
            <p>{group.discussion}</p>
          </div>
        )}

        <div className="form-container">
          {showTaskForm ? (
            <div className="task-form">
              <input
                type="text"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Task name"
                className="input"
              />
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Task description"
                className="input textarea"
                rows="2"
              />
              <input
                type="date"
                value={newTaskStartDate}
                onChange={(e) => setNewTaskStartDate(e.target.value)}
                className="input date-input"
                placeholder="Start date"
              />
              <input
                type="date"
                value={newTaskEndDate}
                onChange={(e) => setNewTaskEndDate(e.target.value)}
                className="input date-input"
                placeholder="End date"
              />
              <div className="form-buttons">
                <button onClick={handleAddTask} className="btn btn-success">
                  Add Task
                </button>
                <button onClick={() => setShowTaskForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowTaskForm(true)} className="btn-add">
              + Add Task
            </button>
          )}
        </div>

        <div className="tasks-grid">
          {(detailedGroup || group).tasks.map(task => (
            <div key={task._id || task.id} className="task-card">
              <div className="task-header">
                <div className="task-info">
                  <h4 className="task-name">{task.name}</h4>
                  {task.description && <p className="task-description">{task.description}</p>}
                </div>
                <div className="task-actions">
                  <button
                    onClick={() => {
                      if (showTaskHistory === task._id) {
                        setShowTaskHistory(null)
                      } else {
                        setShowTaskHistory(task._id)
                        loadTaskHistory(task._id)
                      }
                    }}
                    className="history-btn"
                    title="Task History"
                  >
                    ⏱
                  </button>
                  <button
                    onClick={() => handleEditTask(task)}
                    className="edit-btn"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="delete-btn"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="task-dates">
                {task.startDate && <span className="date">Start: {task.startDate}</span>}
                {task.endDate && <span className="date">End: {task.endDate}</span>}
              </div>
              
              <div className="status-picker-container">
                <div 
                  className={`status-current ${STATUS_COLORS[task.status]}`}
                  onClick={() => setOpenStatusPicker(openStatusPicker === task._id ? null : task._id)}
                >
                  <span className="status-text">{task.status}</span>
                  <span className="status-arrow">▼</span>
                </div>
                {openStatusPicker === task._id && (
                  <div className="status-options">
                    {STATUSES.map(status => (
                      <div
                        key={status}
                        className={`status-option ${STATUS_COLORS[status]} ${task.status === status ? 'active' : ''}`}
                        onClick={async () => {
                          await updateTaskStatus(task._id, status)
                          setOpenStatusPicker(null)
                        }}
                      >
                        <span className="status-dot"></span>
                        {status}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="comments-section">
                <button 
                  className="comments-toggle"
                  onClick={() => setShowComments(showComments === task._id ? null : task._id)}
                >
                  Comments ({(task.comments && task.comments.length) || 0})
                </button>
                
                {showComments === task._id && (
                  <div className="comments-container">
                    <div className="comments-list">
                      {(!task.comments || task.comments.length === 0) ? (
                        <div className="no-comments">No comments yet. Be the first to comment!</div>
                      ) : (
                        task.comments.map(comment => (
                          <div key={comment._id || comment.id} className="comment">
                            <div className="comment-text">{comment.text || ''}</div>
                            <div className="comment-time">{comment.timestamp ? new Date(comment.timestamp).toLocaleString() : ''}</div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="comment-form">
                      <input
                        type="text"
                        value={newComment[task._id] || ''}
                        onChange={(e) => setNewComment(prev => ({ ...prev, [task._id]: e.target.value }))}
                        placeholder="Add a comment..."
                        className="input comment-input"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(task._id)}
                      />
                      <button
                        onClick={() => handleAddComment(task._id)}
                        className="btn btn-primary comment-btn"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {showTaskHistory === task._id && (
                <div className="task-history-section">
                  <h4>Task History</h4>
                  {(!taskHistory[task._id] || taskHistory[task._id].length === 0) ? (
                    <p className="no-logs">No history found for this task</p>
                  ) : (
                    <div className="task-history-list">
                      {taskHistory[task._id].map((log, index) => {
                        const matchingSnapshot = snapshots.find(s => 
                          Math.abs(new Date(s.createdAt) - new Date(log.timestamp)) < 60000
                        )
                        return (
                          <div key={index} className="task-history-item">
                            <div className="log-header">
                              <span className="log-type">{log.eventType}</span>
                              <span className="log-time">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="log-content">
                              <div className="log-message">{log.changes}</div>
                              {matchingSnapshot && (
                                <button 
                                  className="btn btn-restore"
                                  onClick={() => handleRestoreSnapshot(matchingSnapshot.snapshotId)}
                                >
                                  Restore to this point
                                </button>
                              )}
                            </div>
                            {log.user && <div className="log-user">by {log.user}</div>}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="activity-section">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowLogs(!showLogs)}
          >
            {showLogs ? 'Hide' : 'Show'} Activity Logs
          </button>
          
          {showLogs && (
            <div className="logs-container">
              <h3>Recent Activity</h3>
              {logs.length === 0 ? (
                <p className="no-logs">No activity logs found</p>
              ) : (
                <div className="logs-list">
                  {logs.map((log, index) => {
                    const matchingSnapshot = snapshots.find(s => 
                      Math.abs(new Date(s.createdAt) - new Date(log.timestamp)) < 60000
                    )
                    return (
                      <div key={index} className="log-item">
                        <div className="log-header">
                          <span className="log-type">{log.eventType || 'EVENT'}</span>
                          <span className="log-time">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="log-content">
                          <div className="log-message">
                            {log.changes || `${log.eventType} ${log.entity} - ${log.entityId}`}
                          </div>
                          {matchingSnapshot && (
                            <button 
                              className="btn btn-restore"
                              onClick={() => handleRestoreSnapshot(matchingSnapshot.snapshotId)}
                            >
                              Restore to this point
                            </button>
                          )}
                        </div>
                        {log.user && <div className="log-user">by {log.user}</div>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        
        <EditTaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => setEditingTask(null)}
        />
      </div>
    </div>
  )
}

export default GroupDetails