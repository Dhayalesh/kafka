import { useState, useEffect } from 'react'

function EditGroupModal({ group, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    discussion: ''
  })

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || '',
        discussion: group.discussion || ''
      })
    }
  }, [group])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name.trim()) {
      onSave(formData)
    }
  }

  if (!group) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Group</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Group Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="input"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Discussion</label>
            <textarea
              value={formData.discussion}
              onChange={(e) => setFormData({...formData, discussion: e.target.value})}
              className="input textarea"
              rows="3"
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditGroupModal