import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * Poll the URL with a 5 second interval until the step has data
 * available
 * @param url an URL object
 * @param index The index of the step to be polled for
 * @param maximumAttempts The maximum amount of tries for this poll
 * @param attemptCount The amount of attempts already done by the poll, should be left blank
 * @returns The updated JSON response
 */
export async function pollUntilHasData(
  request: AxiosRequestConfig,
  dataParser: (json: any) => boolean,
  maximumAttempts: number = 15,
  attemptCount: number = 0
) {
  if (attemptCount >= maximumAttempts) {
    throw `Failed to get data after ${attemptCount} attempt(s), aborting`
  }
  async function getData() {
    let res = await axios.request(request)

    return res.data
  }

  const json = await getData()

  // Check if the data exists
  const dataExists = dataParser(json)
  if (dataExists) return json

  // The response is still unchanged. Check again in five seconds
  await new Promise((resolve) => setTimeout(resolve, 5000))
  attemptCount++
  await pollUntilHasData(request, dataParser, maximumAttempts, attemptCount)
}

/**
 * Poll the URL with a 5 second interval until it responds with success
 * @param url An URL object
 * @param validate A function that checks if the request is "ok" or valid
 * @param maximumAttempts The maximum amount of tries for this poll
 * @param attemptCount The amount of attempts already done by the poll, should be left blank
 * @returns When it has finished polling
 */
export async function pollUntilOk(
  request: AxiosRequestConfig,
  validate?: (res: AxiosResponse) => boolean,
  maximumAttempts: number = 15,
  attemptCount: number = 0
) {
  if (attemptCount >= maximumAttempts) {
    throw `Failed to get an ok response after ${attemptCount} attempt(s), aborting`
  }
  const res = await axios.request(request)

  if (!validate) {
    validate = (res) => res.status === 200
  }

  // Check that the response from an endpoint updated
  if (validate(res)) {
    return true
  } else {
    // The response is still unchanged. Check again in five seconds
    await new Promise((resolve) => setTimeout(resolve, 5000))
    attemptCount++
    await pollUntilOk(request, validate, maximumAttempts, attemptCount)
  }
}
