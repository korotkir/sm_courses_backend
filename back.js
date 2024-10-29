<%
var template_code = 'sm_course_app';

ERROR = 0;
MESSAGE = "";
RESULT = {};

function get_all_courses(user_id) {
	var all_courses = [];

	sql = Array(
	'sql:',
	'SELECT',
	'	"cs"."id",',
	'	"cs"."name",',
	'	"cs"."duration"',
	'FROM "dbo"."courses" AS "cs"',
	'LEFT JOIN "dbo"."active_learnings" AS "al" ON "cs"."id" = "al"."course_id" AND "al"."person_id" = ' + user_id,
    'WHERE al.course_id IS NULL',
	'ORDER BY "cs"."name"'
).join("\r\n");

	var courses = ArrayDirect(XQuery(sql));

	for (course in courses) {
		all_courses.push({
			id: course.id.Value,
			name: course.name.Value,
			duration: course.duration.Value
		});
	}

	return all_courses;
}

function get_assigned_courses(user_id) {
	var assigned_courses = []

	sql = Array(
		'sql:',
		'SELECT',
		'	"al"."course_id" AS "id",',
		'	"al"."course_name" AS "name",',
		'	"al"."start_usage_date",',
		'	"al"."max_end_date",',
		'	"al"."max_score",',
		'	"al"."score",', 
		'	CASE WHEN "al"."max_score" > 0 THEN ("al"."score"::float / "al"."max_score") * 100 ELSE 0 END AS "percent",',
		'	DATE_PART(\'day\', "al"."max_end_date" - "al"."start_usage_date") AS "duration"',
		'FROM "dbo"."active_learnings" AS "al"',
		'WHERE "al"."person_id" = ' + user_id,
		'ORDER BY "al"."course_name"'
	).join("\r\n");

	var courses = ArrayDirect(XQuery(sql));

	for (course in courses) {
		assigned_courses.push({
			id: course.id.Value,
			name: course.name.Value,
			start_usage_date: course.start_usage_date.Value,
			max_end_date: course.max_end_date.Value,
			max_score: course.max_score.Value,
			score: course.score.Value,
			percent: course.percent.Value,
			duration: course.duration.Value
		});
	}

	return assigned_courses;
}

function assign_course(user_id, course_id) {
	var assign = tools.activate_course_to_person(user_id, course_id);

	if (OptInt(assign, 0) == 0) {
		MESSAGE = "Курс успешно назначен!";
	} else {
		MESSAGE = "Ошибка. Возможно курс уже назначен!";
	}
}


try {
	var req = ParseJson(DecodeCharset(Request.Body, "utf-8"));
	var action = req.action;
	var user_id = curUserID;

	switch(action) {
		case "getAllCourses":
			RESULT = get_all_courses(user_id);
			break;
		case "getAssignedCourses":
			RESULT = get_assigned_courses(user_id);
			break;
		case "assignCourse":
			course_id = req.param.GetOptProperty("course_id", "");
			RESULT = assign_course(user_id, course_id);
			break;
	}

} catch(e) {
	ERROR = 1;
	MESSAGE = 'Ошибка в шаблоне ' + template_code + ": " + e;
}

Response.Write(tools.object_to_text({error: ERROR, message: MESSAGE, result: RESULT}, "json"));
%>