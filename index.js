const result_details_url = "https://cors-w-cookies.herokuapp.com/https://makaut1.ucanapply.com/smartexam/public/result-details"
const get_result_details_url = "https://cors-w-cookies.herokuapp.com/https://makaut1.ucanapply.com/smartexam/public//get-result-details"

function get_results(semcode, roll) {
  return new Promise((resolve, reject) => {
    $.ajax({
      method: "GET",
      url: result_details_url,
      crossDomain: true,
      success: (data, textStatus, xhr) => {
        /* CSRF */
        const csrf_token = /<meta name="csrf-token" content="(\w+)">/g.exec(data)[1]
    
        /* Cookie Magic */
        const x_cookie = xhr.getResponseHeader("x-cookie")
        const xsrf_cookie = /(XSRF-TOKEN=.*?);/g.exec(x_cookie)[1]
        const makaut_cookie = /(maulana_abul_kalam_azad_university_of_technology_session=.*?);/g.exec(x_cookie)[1]
        const total_cookie = xsrf_cookie + "; " + makaut_cookie
    
        /* I love forms */
        let formData = new FormData()
        formData.append("_token", csrf_token)
        formData.append("p1", "")
        formData.append("SEMCODE", semcode)
        formData.append("ROLLNO", roll)
        formData.append("examtype", "result-details")
        formData.append("all", "")
    
        /* Get student's data */
        $.ajax({
          method: "POST",
          url: get_result_details_url,
          crossDomain: true,
          beforeSend: (request) => {
            request.setRequestHeader("x-cookie", total_cookie)
          },
          data: formData,
          processData: false,
          contentType: false,
          success: ({ html }, textStatus, xhr) => {

            const name = /Name :.*?>(.*)<\/strong>/g.exec(html)[1]
            const sgpaOdd = /ODD[\s\S]*?(\d+.\d+)/g.exec(html) ? /ODD[\s\S]*?(\d+.\d+)/g.exec(html)[1] : ""
            const sgpaEven = /EVEN[\s\S]*?(\d+.\d+)/g.exec(html) ? /EVEN[\s\S]*?(\d+.\d+)/g.exec(html)[1] : ""
            if (sgpaEven !== "") {
              const ygpa = /YGPA[\s\S]*?(\d+.\d+)/g.exec(html) ? /YGPA[\s\S]*?(\d+.\d+)/g.exec(html)[1] : ""
              resolve({roll, name, sgpaOdd, sgpaEven, ygpa})
            } else {
              resolve({roll, name, sgpaOdd})
            }

          },
          error: () => { reject() },
        })
      },
      error: () => { reject() }
    })
  })
}

function addResult(res) {
  if ($("#tab-head").text() === "") {

    /* Add table headers */
    let tr = document.createElement("tr")
    const ks = Object.keys(res)
    for (let index in ks) {
      let th = document.createElement("th")
      th.setAttribute("scope", "col")
      th.innerText = ks[index]
      tr.appendChild(th)
    }
    document.getElementById("tab-head").appendChild(tr)

  }

  let tr = document.createElement("tr")

  let th = document.createElement("th")
  th.setAttribute("scope", "row")
  th.innerText = res["roll"]
  tr.appendChild(th)

  th = document.createElement("th")
  th.innerText = res["name"]
  tr.appendChild(th)
  
  th = document.createElement("th")
  th.innerText = res["sgpaOdd"]
  tr.appendChild(th)

  if (res["sgpaEven"]) {
    th = document.createElement("th")
    th.innerText = res["sgpaEven"]
    tr.appendChild(th)
  }

  if (res["ygpa"]) {
    th = document.createElement("th")
    th.innerText = res["ygpa"]
    tr.appendChild(th)
  }
  
  document.getElementById("tab-body").appendChild(tr)

}

function loopres() { 

  document.getElementById("tab-head").innerText = ""
  document.getElementById("tab-body").innerText = ""
  

  const start = $("#start-rno").val()
  const end = $("#end-rno").val()
  const sem = $("#sem-code").val()

  if ((start.length !== 11 || end.length !== 11) && parseInt(start) > parseInt(end))
    return;
  
  for (let i=parseInt(start); i<=parseInt(end); i++) {
    get_results(sem, i.toString(10)).then( data => {
      console.log(data)
      addResult(data)
    })
  }
  
}
