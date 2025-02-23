export default function useDate() {
    
  let d = new Date();
  var datestring =
    d.getFullYear() +
    "-" +
    ("0" + (d.getMonth() + 1)).slice(-2)+
    "-" +
    ("0" + d.getDate()).slice(-2) ;
    return {datestring}
}