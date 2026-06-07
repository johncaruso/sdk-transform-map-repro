# ServiceNow SDK Transform Map Direct Entry Repro

This is a minimal local reproduction for a ServiceNow SDK transform bug in `@servicenow/sdk@4.7.1`.

## Summary

Transforming a `sys_transform_map` with descendant `sys_transform_entry` records folds entries into `ImportSet({ fields })`. A direct entry with:

```xml
<source_field>u_sdk_repro_source_value</source_field>
<target_field>u_sdk_repro_target_value</target_field>
<use_source_script>false</use_source_script>
```

also contains the platform default placeholder `source_script` body:

```xml
<source_script><![CDATA[answer = (function transformEntry(source) {
    return ""; // platform placeholder; ignored when use_source_script=false
})(source);]]></source_script>
```

The SDK emits this direct mapping as an active scripted mapping:

```typescript
u_sdk_repro_target_value: {
    sourceField: 'u_sdk_repro_source_value',
    choiceAction: 'create',
    sourceScript: `answer = (function transformEntry(source) {
    return ""; // platform placeholder; ignored when use_source_script=false
})(source);`,
    useSourceScript: true,
},
```

That changes runtime behavior from copying `source_field` to `target_field` into running a placeholder script that returns an empty string.

## Environment Used

- `@servicenow/sdk`: `4.7.1`
- Node.js: `v24.14.0`
- npm: `11.12.1`
- OS: Linux WSL2

## Repro Steps

```bash
npm install
npm run transform
npm run assert
```

`npm run transform` restores `fixtures/metadata` into `metadata`, clears generated output, then runs:

```bash
now-sdk transform --from metadata
```

The transform is local-only and does not require a ServiceNow instance or credentials.

## Expected Output

The direct mapping should be generated as either a simple direct mapping:

```typescript
fields: {
    u_sdk_repro_target_value: 'u_sdk_repro_source_value',
}
```

or as an object mapping with scripting disabled/absent:

```typescript
fields: {
    u_sdk_repro_target_value: {
        sourceField: 'u_sdk_repro_source_value',
        choiceAction: 'create',
    },
}
```

It should not include `sourceScript`, and it should not set `useSourceScript: true`, because the input XML has `use_source_script=false`.

## Actual Output

Generated file:

`src/fluent/generated/integrations-inbound/table-transform-map/sys_transform_map_11111111111111111111111111111111.now.ts`

Actual direct field output:

```typescript
u_sdk_repro_target_value: {
    sourceField: 'u_sdk_repro_source_value',
    choiceAction: 'create',
    sourceScript: `answer = (function transformEntry(source) {
    return ""; // platform placeholder; ignored when use_source_script=false
})(source);`,
    useSourceScript: true,
},
```

The scripted control entry in the fixture has `use_source_script=true` and is expected to retain `sourceScript`.

## Assertion

`npm run assert` intentionally fails when the direct field contains `sourceScript` or `useSourceScript: true`.

Observed assertion output:

```text
BUG REPRODUCED: direct mapping was generated as a scripted mapping.
Generated file: src/fluent/generated/integrations-inbound/table-transform-map/sys_transform_map_11111111111111111111111111111111.now.ts
u_sdk_repro_target_value: {
            sourceField: 'u_sdk_repro_source_value',
            choiceAction: 'create',
            sourceScript: `answer = (function transformEntry(source) {
    return ""; // platform placeholder; ignored when use_source_script=false
})(source);`,
            useSourceScript: true,
        },
```

## Relevant Fixture Files

- `fixtures/metadata/update/sys_transform_map_11111111111111111111111111111111.xml`
- `fixtures/metadata/update/sys_transform_entry_22222222222222222222222222222222.xml`
- `fixtures/metadata/update/sys_transform_entry_33333333333333333333333333333333.xml`

All sys_ids and field names are synthetic.
