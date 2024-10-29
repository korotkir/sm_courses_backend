<script>

const data = {
  action: "assignCourse" // getAllCourses, getAssignedCourses, assignCourse
  param: {
    course_id: "1234567890"
  }
};

fetch("/custom_web_template.html?object_id=7431092699296461759", {
  method: "POST", 
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify(data)
})
  .then(response => {
    return response.json();
  })
  .then(data => {
    console.log('Успешный ответ: ', data);
  })
  .catch(error => {
    console.error('Ошибка запроса: ', error)
  })
</script>
