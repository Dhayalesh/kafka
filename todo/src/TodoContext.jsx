import { createContext, useContext, useState, useEffect } from 'react'
import todoService from './api/todoService.js'

const TodoContext = createContext()

export const useTodo = () => {
  const context = useContext(TodoContext)
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider')
  }
  return context
}

export const TodoProvider = ({ children }) => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)

  const loadGroups = async () => {
    setLoading(true)
    try {
      const result = await todoService.getGroups()
      if (result.success) {
        setGroups(result.data)
      }
    } catch (error) {
      console.error('Failed to load groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const addGroup = async (name, discussion) => {
    try {
      const result = await todoService.createGroup({ name, discussion })
      if (result.success) {
        setGroups([...groups, result.data])
      }
      return result
    } catch (error) {
      console.error('Failed to create group:', error)
      return { success: false, error }
    }
  }

  const addTask = async (groupId, taskData) => {
    try {
      const result = await todoService.createTask(groupId, taskData)
      if (result.success) {
        await loadGroups()
      }
      return result
    } catch (error) {
      console.error('Failed to create task:', error)
      return { success: false, error }
    }
  }

  const deleteTask = async (taskId) => {
    try {
      const result = await todoService.deleteTask(taskId)
      if (result.success) {
        await loadGroups()
      }
      return result
    } catch (error) {
      console.error('Failed to delete task:', error)
      return { success: false, error }
    }
  }

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const result = await todoService.updateTaskStatus(taskId, newStatus)
      if (result.success) {
        await loadGroups()
      }
      return result
    } catch (error) {
      console.error('Failed to update task status:', error)
      return { success: false, error }
    }
  }

  const deleteGroup = async (groupId) => {
    try {
      const result = await todoService.deleteGroup(groupId)
      if (result.success) {
        await loadGroups()
      }
      return result
    } catch (error) {
      console.error('Failed to delete group:', error)
      return { success: false, error }
    }
  }

  const addComment = async (taskId, comment) => {
    try {
      const result = await todoService.addComment(taskId, comment)
      if (result.success) {
        await loadGroups()
      }
      return result
    } catch (error) {
      console.error('Failed to add comment:', error)
      return { success: false, error }
    }
  }

  const updateGroup = async (groupId, groupData) => {
    try {
      const result = await todoService.updateGroup(groupId, groupData)
      if (result.success) {
        await loadGroups()
      }
      return result
    } catch (error) {
      console.error('Failed to update group:', error)
      return { success: false, error }
    }
  }

  const updateTask = async (taskId, taskData) => {
    try {
      const result = await todoService.updateTask(taskId, taskData)
      if (result.success) {
        await loadGroups()
      }
      return result
    } catch (error) {
      console.error('Failed to update task:', error)
      return { success: false, error }
    }
  }

  const getGroupLogs = async (groupId) => {
    try {
      const result = await todoService.getGroupLogs(groupId)
      return result
    } catch (error) {
      console.error('Failed to load logs:', error)
      return { success: false, error }
    }
  }

  const getAllGroupsLogs = async () => {
    try {
      const result = await todoService.getAllGroupsLogs()
      return result
    } catch (error) {
      console.error('Failed to load groups logs:', error)
      return { success: false, error }
    }
  }

  const getSnapshots = async () => {
    try {
      const result = await todoService.getSnapshots()
      return result
    } catch (error) {
      console.error('Failed to load snapshots:', error)
      return { success: false, error }
    }
  }

  const restoreSnapshot = async (snapshotId) => {
    try {
      const result = await todoService.restoreSnapshot(snapshotId)
      if (result.success) {
        await loadGroups()
      }
      return result
    } catch (error) {
      console.error('Failed to restore snapshot:', error)
      return { success: false, error }
    }
  }



  useEffect(() => {
    loadGroups()
  }, [])

  return (
    <TodoContext.Provider value={{
      groups,
      loading,
      loadGroups,
      addGroup,
      updateGroup,
      deleteGroup,
      addTask,
      updateTask,
      deleteTask,
      updateTaskStatus,
      addComment,
      getGroupLogs,
      getAllGroupsLogs,
      getSnapshots,
      restoreSnapshot
    }}>
      {children}
    </TodoContext.Provider>
  )
}