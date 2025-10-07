// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { fetchWithCache } from "@mf-single-spa-demo/api";
// import { combineLatest } from "rxjs";

export function getTimesheetData(pageNum = 1) {
    return fetchWithCache(`timesheets?page=${pageNum}`)
}

// export function getPlanet(id) {
//     return fetchWithCache(`planets/${id}/`);
// }
//
// export function getPerson(peronNumber) {
//     return fetchWithCache(`people/${peronNumber}/`);
// }
//
// export function getPeopleByIds(people = []) {
//     const peopleObsArray = people.map((person) => {
//         return fetchWithCache(`people/${person}/`);
//     });
//     return combineLatest(peopleObsArray);
// }

export function getEmployee(idOrCode: string | number) {
    const str = String(idOrCode);
    const isNumeric = /^[0-9]+$/.test(str);
    const url = isNumeric ? `employees/${str}/` : `employees?code=${encodeURIComponent(str)}`;
    return fetchWithCache(url);
}
