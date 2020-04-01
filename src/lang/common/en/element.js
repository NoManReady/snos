import enLocale from 'element-ui/lib/locale/lang/en'

const elchange = {
    el: {
        datepicker: {
            selectDate: 'Select a date',
            selectTime: 'Select a time',
            prevYear: 'Last Year',
            prevMonth: 'Last Month',
        },
        pagination: {
            goto: 'Go to page'
        }
    }
}
Object.assign(enLocale.el.datepicker, elchange.el.datepicker)
Object.assign(enLocale.el.pagination, elchange.el.pagination)
export default enLocale
