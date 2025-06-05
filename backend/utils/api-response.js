export class ApiResponse {
  constructor(status, { message = null, data = null, errors = null } = {}) {
    this.status = status;     // "success", "fail", or "error"
    this.message = message;
    this.data = data;
    this.errors = errors;
  }

  static success(data = null, message = '', status = 200) {
    return {
      success: true,
      status,
      message,
      data,
    };
  }

  static error(message = '', status = 400, data = null) {
    return {
      success: false,
      status,
      message,
      data,
    };
  }
}
