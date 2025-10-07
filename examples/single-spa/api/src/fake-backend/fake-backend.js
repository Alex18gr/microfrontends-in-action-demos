import employees from "./employees.json";
import timesheets from "./timesheets.json";
import customers from "./customers.json";
import orders from "./orders.json";

export function fakeAPIFetch(options) {
  if (options.url.includes("employees")) {
    return handleFakeRequestForEmployees(options.url);
  } else if (options.url.includes("timesheets")) {
    return handleFakeRequestForTimesheets(options.url);
  } else if (options.url.includes("customers")) {
    return handleFakeRequestForCustomers(options.url);
  } else if (options.url.includes("orders")) {
    return handleFakeRequestForOrders(options.url);
  }
  return Promise.resolve({});
}

function getIndividualThing(id, list) {
  return list[id - 1]; // right now the lists are ordered so that index === id - 1
}

function handleIndividualRequest(url, list, modifierFn) {
  const regex = /[0-9+]/;
  const match = regex.exec(url);
  const id = match.length === 1 ? parseInt(match) : 1;
  const thing = getIndividualThing(id, list);
  const base = { id: `${thing.pk}`, ...thing.fields };
  let response;
  if (modifierFn) {
    response = modifierFn(base);
  } else {
    response = base;
  }
  return fakeNetwork(response);
}

function handleListRequest(url, list, modifierFn) {
  const regex = /[0-9+]/;
  const match = regex.exec(url);
  const pageNum = match.length === 1 ? parseInt(match) : 1;
  const pageSize = 10;
  const startingIndex = pageSize * (pageNum - 1);
  const endingIndex = pageSize * pageNum;
  const next = endingIndex < list.length;
  return fakeNetwork({
    results: list
      .slice(pageSize * (pageNum - 1), pageSize * pageNum)
      .map((listItem) => {
        const standardModifications = turnObjectIntoFakeApiResponse(listItem);
        if (modifierFn) {
          return modifierFn(standardModifications);
        } else {
          return standardModifications;
        }
      }),
    next,
  });
}

function turnObjectIntoFakeApiResponse(obj) {
  return {
    ...obj.fields,
    id: `${obj.pk}`,
    url: `${obj.model.split(".")[1]}/${obj.pk}`,
  };
}

function wrapWithData(response) {
  return { results: response };
}

function fakeNetwork(response, delay = 100) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res(response);
    }, delay);
  });
}


// New handlers for business entities
function handleFakeRequestForEmployees(url) {
  if (url.includes("page")) {
    return handleListRequest(url, employees, modifyEmployee);
  } else if (url.includes("code=")) {
    // Support lookup by EmployeeNumber, e.g., employees?code=E1001
    const afterCode = url.split("code=")[1] || "";
    const code = decodeURIComponent(afterCode.split("&")[0]);
    const id = getEmployeeIdByEmployeeNumber(code);
    if (!id) {
      // Not found - return empty object to mimic a 404-like response shape
      return fakeNetwork({});
    }
    // Reuse individual handler by constructing a URL with the numeric id
    return handleIndividualRequest(`employees/${id}/`, employees, modifyEmployee);
  } else {
    return handleIndividualRequest(url, employees, modifyEmployee);
  }
}

function handleFakeRequestForTimesheets(url) {
  if (url.includes("page")) {
    return handleListRequest(url, timesheets, modifyTimesheet);
  } else {
    return handleIndividualRequest(url, timesheets, modifyTimesheet);
  }
}

function handleFakeRequestForCustomers(url) {
  if (url.includes("page")) {
    return handleListRequest(url, customers, modifyCustomer);
  } else {
    return handleIndividualRequest(url, customers, modifyCustomer);
  }
}

function handleFakeRequestForOrders(url) {
  if (url.includes("page")) {
    return handleListRequest(url, orders, modifyOrder);
  } else {
    return handleIndividualRequest(url, orders, modifyOrder);
  }
}

// Relationship helpers for new entities
function getCustomersForEmployeeNumber(empNum) {
  return customers.reduce((acc, c) => {
    if (c.fields.assignedEmployeeNumber === empNum) {
      acc.push(`${c.pk}`);
    }
    return acc;
  }, []);
}

function getTimesheetsForEmployeeNumber(empNum) {
  return timesheets.reduce((acc, t) => {
    if (t.fields.EmployeeNumber === empNum) {
      acc.push(`${t.pk}`);
    }
    return acc;
  }, []);
}

function getOrdersForCustomerId(customerId) {
  return orders.reduce((acc, o) => {
    if (o.fields.customerId === customerId) {
      acc.push(`${o.pk}`);
    }
    return acc;
  }, []);
}

function getEmployeeIdByEmployeeNumber(empNum) {
  const match = employees.find((e) => e.fields.EmployeeNumber === empNum);
  return match ? `${match.pk}` : null;
}

function getCustomerPkByCustomerId(customerId) {
  const match = customers.find((c) => c.fields.customerId === customerId);
  return match ? `${match.pk}` : null;
}

// Modifiers for new entities
function modifyEmployee(employee) {
  const customersList = getCustomersForEmployeeNumber(employee.EmployeeNumber);
  const timesheetsList = getTimesheetsForEmployeeNumber(employee.EmployeeNumber);
  return {
    ...employee,
    customers: customersList,
    timesheets: timesheetsList,
  };
}

function modifyTimesheet(timesheet) {
  const employeeId = getEmployeeIdByEmployeeNumber(timesheet.EmployeeNumber);
  return {
    ...timesheet,
    employeeId,
  };
}

function modifyCustomer(customer) {
  const ordersList = getOrdersForCustomerId(customer.customerId);
  const assignedEmployeeId = getEmployeeIdByEmployeeNumber(
    customer.assignedEmployeeNumber
  );
  return {
    ...customer,
    orders: ordersList,
    assignedEmployeeId,
  };
}

function modifyOrder(order) {
  const customerPk = getCustomerPkByCustomerId(order.customerId);
  return {
    ...order,
    customerPk,
  };
}
