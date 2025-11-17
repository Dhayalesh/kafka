import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTodo } from './TodoContext'
import EditGroupModal from './components/EditGroupModal'

function GroupsList() {
  const { groups, addGroup, updateGroup, deleteGroup, getAllGroupsLogs, restoreSnapshot, getSnapshots } = useTodo()
  const navigate = useNavigate()
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDiscussion, setNewGroupDiscussion] = useState('')
  const [editingGroup, setEditingGroup] = useState(null)
  const [logs, setLogs] = useState([])
  const [showLogs, setShowLogs] = useState(false)
  const [snapshots, setSnapshots] = useState([])

  const handleAddGroup = async () => {
    if (newGroupName.trim()) {
      const result = await addGroup(newGroupName, newGroupDiscussion)
      if (result.success) {
        setNewGroupName('')
        setNewGroupDiscussion('')
      }
    }
  }

  const handleGroupClick = (groupId) => {
    navigate(`/group/${groupId}`)
  }

  const handleDeleteGroup = async (e, groupId) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this group? All tasks will be deleted.')) {
      await deleteGroup(groupId)
    }
  }

  const handleEditGroup = (e, group) => {
    e.stopPropagation()
    setEditingGroup(group)
  }

  const handleSaveGroup = async (groupData) => {
    const result = await updateGroup(editingGroup._id, groupData)
    if (result.success) {
      setEditingGroup(null)
    }
  }

  const loadGroupsLogs = async () => {
    const result = await getAllGroupsLogs()
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
        alert(`Database restored successfully! (${result.snapshotId})\nGroups: ${result.restoredCounts.groups}, Tasks: ${result.restoredCounts.tasks}`)
        window.location.href = window.location.href
      } else {
        alert('Restore failed: ' + result.error)
      }
    }
  }



  useEffect(() => {
    if (showLogs) {
      loadGroupsLogs()
      loadSnapshots()
    }
  }, [showLogs])

  return (
    <div className="container">
      <div className="max-width">
        
        <div className="form-container">
          <div className="form-row">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Enter group name"
              className="input"
            />
            <textarea
              value={newGroupDiscussion}
              onChange={(e) => setNewGroupDiscussion(e.target.value)}
              placeholder="Group discussion (optional)"
              className="input textarea"
              rows="2"
            />
            <button
              onClick={handleAddGroup}
              className="btn btn-primary"
            >
              Add Group
            </button>
          </div>
        </div>

        <div className="grid">
          {groups.map(group => (
            <div 
              key={group.id} 
              className="card group-card"
              onClick={() => handleGroupClick(group._id)}
            >
              <div className="group-header">
                <h2 className="card-title">{group.name}</h2>
                <div className="group-actions">
                  <button
                    onClick={(e) => handleEditGroup(e, group)}
                    className="edit-btn"
                  >
                    ✎
                  </button>
                  <button
                    onClick={(e) => handleDeleteGroup(e, group._id)}
                    className="delete-btn"
                  >
                    ×
                  </button>
                </div>
              </div>
              {group.discussion && (
                <div className="group-discussion">
                  <p>{group.discussion}</p>
                </div>
              )}
              <div className="group-stats">
                <span className="task-count">{group.taskCount || 0} tasks</span>
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
                  {logs.map((groupSummary, index) => {
                    // Find the snapshot closest in time to the group's lastActivity.
                    // Previously we used `find()` which returned the first match (often the latest),
                    // causing restores to pick the wrong snapshot. Here we pick the snapshot with
                    // the smallest absolute time difference and only accept it if it's within 5 minutes.
                    let matchingSnapshot = null;
                    if (Array.isArray(snapshots) && snapshots.length > 0 && groupSummary.lastActivity) {
                      const target = new Date(groupSummary.lastActivity);
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
                          <span className="log-type">{groupSummary.groupName || 'Unknown Group'}</span>
                          <span className="log-time">
                            {groupSummary.lastActivity ? new Date(groupSummary.lastActivity).toLocaleString() : 'No activity'}
                          </span>
                        </div>
                        <div className="log-content">
                          <div className="log-message">
                            {groupSummary.logCount || 0} event{groupSummary.logCount !== 1 ? 's' : ''} logged
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
        
        <EditGroupModal
          group={editingGroup}
          onSave={handleSaveGroup}
          onClose={() => setEditingGroup(null)}
        />
      </div>
    </div>
  )
}

export default GroupsList