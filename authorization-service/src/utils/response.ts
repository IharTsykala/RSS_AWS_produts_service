export const response = (body: any) => {
  return {
    // statusCode,
    // headers: {
    //   'Access-Control-Allow-Credentials': true,
    //   'Access-Control-Allow-Origin': '*',
    //   'Access-Control-Allow-Headers': '*',
    // },
    ...body,
  }
}
