import { ImportSet } from '@servicenow/sdk/core'

ImportSet({
    $id: Now.ID['11111111111111111111111111111111'],
    name: 'SDK Direct Entry Repro Transform',
    targetTable: 'sys_user',
    sourceTable: 'sys_user',
    active: true,
    runBusinessRules: true,
    fields: {
        u_sdk_repro_target_value: {
            sourceField: 'u_sdk_repro_source_value',
            choiceAction: 'create',
            sourceScript: `answer = (function transformEntry(source) {
    return ""; // platform placeholder; ignored when use_source_script=false
})(source);`,
        },
        u_sdk_repro_scripted_target: {
            sourceField: '[Script]',
            choiceAction: 'create',
            sourceScript: `answer = (function transformEntry(source) {
    return "scripted control value";
})(source);`,
            useSourceScript: true,
        },
    },
    runScript: false,
})
