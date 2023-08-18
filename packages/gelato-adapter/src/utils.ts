const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time))

// Helper function to poll the status of a Gelato relay task given the taskId
export const getTaskStatus = async (taskId: string) => {
  let taskState
  const terminalStates = ['ExecReverted', 'Cancelled', 'ExecSuccess']
  do {
    const response = await fetch(
      `https://api.gelato.digital/tasks/status/${taskId}`
    )
    const status = await response.json()
    taskState = status.task.taskState
    if (taskState === 'ExecSuccess') {
      // Success case - return transaction hash
      return status.task.transactionHash
    } else if (taskState === 'ExecReverted' || taskState === 'Cancelled') {
      // Error case - return undefined
      throw new Error(
        `Transaction failed in taskId ${taskId} with error: ${status.task.lastCheckMessage}`
      )
    } else {
      await sleep(3000)
    }
  } while (!terminalStates.includes(taskState))
}
