# ServiceNow SDK Transform Map Direct Entry Repro

A minimal local reproduction of a ServiceNow SDK transform bug in `@servicenow/sdk`, reported as [ServiceNow/sdk discussion #77](https://github.com/ServiceNow/sdk/discussions/77).

**Status: fixed in `4.11.2`** (maintainer answer, 2026-09-10). It reproduced on `4.7.1` through `4.10.0`. Verified fixed on `4.14.0` (2026-11-02).

## Summary

Transforming a `sys_transform_map` with descendant `sys_transform_entry` records folds the entries into `ImportSet({ fields })`. Here is a direct entry:

```xml
<source_field>u_sdk_repro_source_value</source_field>
<target_field>u_sdk_repro_target_value</target_field>
<use_source_script>false</use_source_script>
```

It also carries the platform's default placeholder `source_script` body:

```xml
<source_script><![CDATA[answer = (function transformEntry(source) {
    return ""; // platform placeholder; ignored when use_source_script=false
})(source);]]></source_script>
```

On `4.7.1` through `4.10.0`, transform emitted this direct mapping as an active scripted mapping:

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

That changed runtime behavior. The entry ran a placeholder script that returns an empty string instead of copying `source_field` to `target_field`.

From `4.11.2`, transform no longer emits `useSourceScript: true` for this entry, and the build writes `use_source_script=false`. Transform still copies the placeholder text as `sourceScript`. That leftover is inert, because scripting stays off, but it is noise worth deleting by hand after a transform.

## Environment Used

- `@servicenow/sdk`: `4.14.0`
- Node.js: `v24.22.2`
- npm: `11.19.1`
- OS: Linux WSL2

## Repro Steps

```bash
npm install
npm run verify
```

`npm run verify` runs `transform`, `build` and `assert`. `npm run transform` restores `fixtures/metadata` into `metadata`, clears the generated output, then runs:

```bash
now-sdk transform --from metadata
```

It all runs locally, with no ServiceNow instance or credentials.

## Assertion

`npm run assert` fails (`BUG REPRODUCED`) when any of these hold:

- the generated direct field has `useSourceScript: true`
- the scripted control entry (`use_source_script=true` in the fixture) loses `useSourceScript: true`
- after `npm run build`, the built `sys_transform_entry` XML has `use_source_script` other than `false` for the direct entry or other than `true` for the control

A leftover placeholder `sourceScript` on the direct field is reported as a `NOTE` and does not fail the assert.

Output on `4.14.0`:

```text
Generated file: src/fluent/generated/integrations-inbound/table-transform-map/sys_transform_map_11111111111111111111111111111111.now.ts
NOTE: Fluent: u_sdk_repro_target_value still carries the platform placeholder sourceScript. It is inert because scripting stays off.
PASS: direct mapping remained direct.
```

Against the `4.10.0` output it fails with `Fluent: u_sdk_repro_target_value has useSourceScript: true`.

## Relevant Fixture Files

- `fixtures/metadata/update/sys_transform_map_11111111111111111111111111111111.xml`
- `fixtures/metadata/update/sys_transform_entry_22222222222222222222222222222222.xml`
- `fixtures/metadata/update/sys_transform_entry_33333333333333333333333333333333.xml`

All sys_ids and field names are synthetic.
