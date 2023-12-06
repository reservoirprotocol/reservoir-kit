## Deploying ReservoirKit and SDK

Before starting the process ensure that you're a member of the reservoir0x organization and you have maintainer permissions. You'll also need to be logged into npmjs in your terminal or have an access token granting you permission to upload new versions of the packages.

### Generating a Build

1. Switch to the main branch and pull to get the latest.
2. Go into each of the package folders being updated and run `yarn version:update X`, replace X with the correct release type (patch, minor or major). Patch is for small bugs that do not impact ux or have breaking changes. Minor is for breaking changes or new features. Major is for complete refactors of existing logic and funcionality. Running this command will update the version of the package json, commit the changes, tag the commit and push the code.
3. All that's left to do is run `yarn publish:stable` at the root level, this will build all packages and deploy to npm only the ones marked with a new version.
4. Now run `yarn changelog` at the root level, this will generate the changelog and commit the changes. Review the generated changelog files before pushing the changes, make sure to clean up the title of each merge to make it more readable and add any additional information that may be useful.
