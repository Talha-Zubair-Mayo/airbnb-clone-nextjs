const CronJob = require("node-cron");
const MeetingSchedule = require("@/views/EmailTemplates/MeetingSchedule");
const SendMail = require("./SendEmail");
var JobArray = []
const initScheduledJobs = (Meeting, Agent) => {
    const dateToCron = (date) => {
        const minutes = date.getMinutes();
        const hours = date.getHours();
        const days = date.getDate();
        const months = date.getMonth() + 1;
        const dayOfWeek = date.getDay();

        return `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`;
    };
    const date = new Date(Meeting.meetingTime);
    const cron = dateToCron(date);
    JobArray.push(CronJob.schedule(dateToCron(date), () => {
        const html = MeetingSchedule(Meeting, Agent);
        SendMail('awhitlo4@asu.edu', html, "Appointment");
    }))

    JobArray.forEach((item) => {
        item.start();
    });
}



module.exports = initScheduledJobs;