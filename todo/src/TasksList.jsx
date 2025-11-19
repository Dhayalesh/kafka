import { useState, useEffect } from 'react'
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

function TasksList() {
  const { tasks, addTask, updateTask, deleteTask, updateTaskStatus, updateTaskProgress, addComment, getSnapshots, restoreSnapshot } = useTodo()

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
  const [editingProgress, setEditingProgress] = useState(null)
  const [progressValue, setProgressValue] = useState(0)

  const handleAddTask = async () => {
    if (newTaskName.trim()) {
      const result = await addTask({
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
    const result = await todoService.getAllTasksLogs()
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

  const handleRestoreSnapshot = async (snapshotId) => {
    if (window.confirm('Are you sure you want to restore to this version? Current data will be replaced.')) {
      const result = await restoreSnapshot(snapshotId)
      if (result.success) {
        alert(`Database restored successfully! (${result.snapshotId})\nTasks: ${result.restoredCounts.tasks}`)
        window.location.reload()
      } else {
        alert('Restore failed: ' + result.error)
      }
    }
  }

  const handleProgressEdit = (taskId, currentProgress) => {
    setEditingProgress(taskId)
    setProgressValue(currentProgress || 0)
  }

  const handleProgressSave = async (taskId) => {
    const result = await updateTaskProgress(taskId, progressValue)
    if (result.success) {
      setEditingProgress(null)
    }
  }

  const handleProgressCancel = () => {
    setEditingProgress(null)
    setProgressValue(0)
  }

  useEffect(() => {
    if (showLogs) {
      loadLogs()
      loadSnapshots()
    }
  }, [showLogs])

  return (
    <div className="container">
      <div className="max-width">
        <h1 className="title">Task Manager</h1>

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
          {tasks.map(task => (
            <div key={task._id || task.id} className="task-card">
              <div className="task-header">
                <div className="task-info">
                  <h4 className="task-name">{task.name}</h4>
                  {task.description && <p className="task-description">{task.description}</p>}
                </div>
                <div className="task-actions">
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

              <div className="progress-section">
                <div className="progress-header">
                  <span className="progress-label">Progress: {task.progress || 0}%</span>
                  {task.status === 'In Progress' && editingProgress !== task._id && (
                    <button
                      className="edit-progress-btn"
                      onClick={() => handleProgressEdit(task._id, task.progress)}
                    >
                      ✎
                    </button>
                  )}
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${task.progress || 0}%` }}
                  ></div>
                </div>
                {editingProgress === task._id && (
                  <div className="progress-editor">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progressValue}
                      onChange={(e) => setProgressValue(parseInt(e.target.value))}
                      className="progress-slider"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={progressValue}
                      onChange={(e) => setProgressValue(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="progress-input"
                    />
                    <div className="progress-buttons">
                      <button onClick={() => handleProgressSave(task._id)} className="btn btn-success">
                        Save
                      </button>
                      <button onClick={handleProgressCancel} className="btn btn-secondary">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
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
            </div>
          ))}
        </div>

        <div className="activity-section">
          <button
            className="btn btn-secondary"
            onClick={() => setShowLogs(!showLogs)}
          >
            {showLogs ? 'Hide' : 'Show'} Activity History
          </button>

          {showLogs && (
            <div className="logs-container">
              <h3>Activity History with Restore Points</h3>
              {logs.length === 0 ? (
                <p className="no-logs">No activity logs found</p>
              ) : (
                <div className="logs-list">
                  {logs.map((taskSummary, index) => {
                    let matchingSnapshot = null;
                    if (Array.isArray(snapshots) && snapshots.length > 0 && taskSummary.lastActivity) {
                      const target = new Date(taskSummary.lastActivity);
                      let minDiff = Infinity;
                      for (const s of snapshots) {
                        const diff = Math.abs(new Date(s.createdAt) - target);
                        if (diff < minDiff) {
                          minDiff = diff;
                          matchingSnapshot = s;
                        }
                      }
                      // only accept snapshots within 5 minutes (300000 ms)
                      if (minDiff > 300000) matchingSnapshot = null;
                    }

                    return (
                      <div key={index} className="log-item">
                        <div className="log-header">
                          <span className="log-type">{taskSummary.taskName || 'Unknown Task'}</span>
                          <span className="log-time">
                            {taskSummary.lastActivity ? new Date(taskSummary.lastActivity).toLocaleString() : 'No activity'}
                          </span>
                        </div>
                        <div className="log-content">
                          <div className="log-message">
                            {taskSummary.logCount || 0} event{taskSummary.logCount !== 1 ? 's' : ''} logged
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

export default TasksList
