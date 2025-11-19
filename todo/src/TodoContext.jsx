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
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)

  const loadTasks = async () => {
    setLoading(true)
    try {
      const result = await todoService.getTasks()
      if (result.success) {
        setTasks(result.data)
      }
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (taskData) => {
    try {
      const result = await todoService.createTask(taskData)
      if (result.success) {
        await loadTasks()
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
        await loadTasks()
      } else {
        alert(`Failed to delete task: ${result.error?.message || 'Task not found. Please refresh the page.'}`)
      }
      return result
    } catch (error) {
      console.error('Failed to delete task:', error)
      alert('Failed to delete task. Please refresh the page.')
      return { success: false, error }
    }
  }

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const result = await todoService.updateTaskStatus(taskId, newStatus)
      if (result.success) {
        await loadTasks()
      }
      return result
    } catch (error) {
      console.error('Failed to update task status:', error)
      return { success: false, error }
    }
  }

  const updateTaskProgress = async (taskId, progress) => {
    try {
      const result = await todoService.updateTaskProgress(taskId, progress)
      if (result.success) {
        await loadTasks()
      }
      return result
    } catch (error) {
      console.error('Failed to update task progress:', error)
      return { success: false, error }
    }
  }

  const addComment = async (taskId, comment) => {
    try {
      const result = await todoService.addComment(taskId, comment)
      if (result.success) {
        await loadTasks()
      }
      return result
    } catch (error) {
      console.error('Failed to add comment:', error)
      return { success: false, error }
    }
  }

  const updateTask = async (taskId, taskData) => {
    try {
      const result = await todoService.updateTask(taskId, taskData)
      if (result.success) {
        await loadTasks()
      } else {
        alert(`Failed to update task: ${result.error?.message || 'Task not found. Please refresh the page.'}`)
      }
      return result
    } catch (error) {
      console.error('Failed to update task:', error)
      alert('Failed to update task. Please refresh the page.')
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
        await loadTasks()
      }
      return result
    } catch (error) {
      console.error('Failed to restore snapshot:', error)
      return { success: false, error }
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  return (
    <TodoContext.Provider value={{
      tasks,
      loading,
      loadTasks,
      addTask,
      updateTask,
      deleteTask,
      updateTaskStatus,
      updateTaskProgress,
      addComment,
      getSnapshots,
      restoreSnapshot
    }}>
      {children}
    </TodoContext.Provider>
  )
}
