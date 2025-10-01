export default {
    reporters: [
        'default',
        ['jest-html-reporter', { 
            pageTitle: 'Test Report - Appointment Scheduler',
            outputPath: './test-report.html', 
            includeFailureMsg: true,
        }],
    ],
};