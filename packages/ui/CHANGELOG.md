
## [v1.21.5-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/f2a696a7d1065c2de6cf76a91311f05ac3f6c1c8) (2023-12-19)

* SDK Bump

## [v1.21.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/e8bfe97538758663202cfd61b71d7451ea59276b) (2023-12-18)

* BidModal: Update ui to make it more consistent [865bb649](https://github.com/reservoirprotocol/reservoir-kit/commit/865bb64954a0fce914e475e4a1fa469650e66389)
## [v1.21.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/dc4e3d8b15719488cb6478a7f533eba3c8bf9b9c) (2023-12-15)

* SDK Bump

## [v1.21.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/6ba603bd4f383bc450ce296cd16e98ae36d7184a) (2023-12-14)

* SDK Bump

## [v1.21.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/611ca258546842b0c8b89af0cac1d3d593e18dee) (2023-12-13)

* MintModal: Improve Error Handling [b3f4552b](https://github.com/reservoirprotocol/reservoir-kit/commit/b3f4552b322dc4a3c1ffd27edc79151550e7e05f)

## [v1.21.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/e5545f33e2a6a2866703ac3f54b8e5db05c85994) (2023-12-04)

* MintModal: New mint modal that uses the new mint api [c1cbf47c](https://github.com/reservoirprotocol/reservoir-kit/commit/c1cbf47c48066da8d2cbb50f5c40e5c3c192c8bf)
* Fix bug with zora testnet explorer url [5ea5d4e7](https://github.com/reservoirprotocol/reservoir-kit/commit/5ea5d4e750baf090fab1dece078b784d63e50a08)

## [v1.20.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/5f88005cfdc068f39ced6fdc7eb8eac3f7017d2a) (2023-11-29)

* EditBidModal & EditListingModal: respect 721c pricing constraints [e0f45670](https://github.com/reservoirprotocol/reservoir-kit/commit/e0f45670b7a81e65564c7a2e8d1840f1fe6825c4)
* ListModal & BidModal: use marketplace configs and add price restrictions [7f8b9e2a](https://github.com/reservoirprotocol/reservoir-kit/commit/7f8b9e2a2d97e71c0c09eafa24f96b6d5e823e65)

### Breaking Changes
* If you previously relied on the supported-marketplaces api this is not longer the api that powers the bid/list modal. Instead there's a new api, the marketplace configurations api, which returns available exchanges per marketplace. This gives develops the flexibility to choose the right exchange while also giving them more in depth exchange rules.

## [v1.19.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/2e76121039d3782f7dcd72f6f4dae2a9b7472eb8) (2023-11-29)

* Add onPointerDownOutside override to all modals [69b97a48](https://github.com/reservoirprotocol/reservoir-kit/commit/69b97a484fbbf5a6d4d9e642d3dcafe79e618db2)

## [v1.19.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/cf4e26066857979ba32c318ba2d6fbe0e465ecf3) (2023-11-22)

* BuyModal: fix 1155 default path state [eb81f012](https://github.com/reservoirprotocol/reservoir-kit/commit/eb81f012abc3919473a5b4e9f0a75b4158508aad)

## [v1.19.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/9df6c416b4ac46b50881ce29174ae81ff83540eb) (2023-11-21)

* Fix: txHash refactor build error in Cart component [0e8fc880](https://github.com/reservoirprotocol/reservoir-kit/commit/0e8fc8807f79614d4dbca0d65667e7827a7b553b)

## [v1.19.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/7172fcf07793496cb934048d5bd22836782e1371) (2023-11-21)

* Fix: improve BuyModal error handling for 1155s and fix client-side exception [3c7565ff](https://github.com/reservoirprotocol/reservoir-kit/commit/3c7565ff1b989de1cac121347cf3d6c02df449bc)

## [v1.19.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/cb380a06e5d6b04db133cb19663214b78271e88a) (2023-11-20)

* CollectModal: improve post mint image experience [d7a9a935](https://github.com/reservoirprotocol/reservoir-kit/commit/d7a9a93562b320437fac197679dafe3b4040f545)
* Fix alwaysIncludeListingCurrency in paymentTokens [78d8fe03](https://github.com/reservoirprotocol/reservoir-kit/commit/78d8fe030b084174edc154e68fa45d187e4099e0)
* Use seaport v1.5 for oracle orders [280b1b27](https://github.com/reservoirprotocol/reservoir-kit/commit/280b1b27db2c483082b5583d598327e853c66510)
* CollectModal & BuyModal: Fix expected price sweep bugs [08822d0a](https://github.com/reservoirprotocol/reservoir-kit/commit/08822d0a8d5e63cfe991fe220aedd9c54cc325cc)
* BidModal, ListModal, EditBidModal, EditListingModal: filter custom on dropdown [3d610e37](https://github.com/reservoirprotocol/reservoir-kit/commit/3d610e37ae1e50027ebd6c8f299904870eabc37c)
* Respect maxQuantity in case the path quantity is higher than the max [1012217f](https://github.com/reservoirprotocol/reservoir-kit/commit/1012217f5128364e8acee8ec0359b6d9406cfaee)
* CollectModal: fix maxQuantity calculation [8c322b92](https://github.com/reservoirprotocol/reservoir-kit/commit/8c322b92ad48a04ab4b321bed027695018b2c205)

### Breaking Changes:
* txHash has now been replaced with an array of txHashes, which contain the transaction hash and the chain id on which it was originated.

## [v1.18.10-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/339a9c0ccf21e04e75ed2e5d379cfa17b7e4ff4a) (2023-11-16)

* Fix SelectPaymentToken icon aspect ratio [6124eadb](https://github.com/reservoirprotocol/reservoir-kit/commit/6124eadbbaddbe6d0fc279f2a6aa4195fb6dc0d5)

## [v1.18.9-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/32e1cc9aee6c48913589c2e6502acc9c704798f6) (2023-11-16)

* Add Solver Capacity check for crosschain purchases [37141f14](https://github.com/reservoirprotocol/reservoir-kit/commit/37141f14f60cda53b613268926ef450588021fee)
* AcceptBidModal: Add feesOnTop and feesOnTopCustom [37e1d874](https://github.com/reservoirprotocol/reservoir-kit/commit/37e1d874e1bb312fc70af5d165118edd6a873958)

## [v1.18.8-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/4ad23190b1c0ae1c0f6390ffc34ca0071ac30adf) (2023-11-14)

* ListModal: fix marketplace fee breakdown [addfc729](https://github.com/reservoirprotocol/reservoir-kit/commit/addfc72973159f7aab872bc6817493c9787bcc46)

## [v1.18.7-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/c46d6307568b472423c70c1d5dcd2e3e5db9e419) (2023-11-14)

* useTrendingCollections hook [fa0db2f5](https://github.com/reservoirprotocol/reservoir-kit/commit/fa0db2f5a324584814f51318a6189816a44ac8fa)
* useTrendingMints hook [9759359b](https://github.com/reservoirprotocol/reservoir-kit/commit/9759359ba90f57b7801b8887afc6c83eeeedae44)
* Add preferDisplayFiatTotal configuration [701aba3c](https://github.com/reservoirprotocol/reservoir-kit/commit/701aba3c46662a45bca46aec6220eada3ccd274a)

## [v1.18.6-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/a9048b549e6e92da33681c5f5fe1d830b47d6131) (2023-11-13)

* Update SDK

## [v1.18.5-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/9b76a9e5b59783d02d1cdaec5f3b8b5670a84f52) (2023-11-13)

* Misc Bug Fixes

## [v1.18.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/71bef10a2ffef6cf525afc7f4e46dbde57b8d9c0) (2023-11-10)

* Fix select currency icon aspect ratio [b95aca22](https://github.com/reservoirprotocol/reservoir-kit/commit/b95aca22cdb55b181d0190155ddc6becac75f091)
* Fix token media refresh to use contract instead of collectionId [a35dcc24](https://github.com/reservoirprotocol/reservoir-kit/commit/a35dcc24b229dfc501520ac3a33ee50fa0ec46b1)
* feat: Use new fee params [6c4332a7](https://github.com/reservoirprotocol/reservoir-kit/commit/6c4332a7a42ae707689b65e39ccc9fac6eae2062)

## [v1.18.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/c78ccc64bf55958ab8f5ca8bd97b4df6a2fcf6cd) (2023-11-09)

* Fix payment tokens loading bug [e059354b](https://github.com/reservoirprotocol/reservoir-kit/commit/e059354bb3e557ca58ce55c43f0fd95c1abc9bf3)
* Fix two ui states showing simultaneously in CollectModal [4dd57c82](https://github.com/reservoirprotocol/reservoir-kit/commit/4dd57c82ebb82addb694a96822278c8ada16196d)
* Update cross-chain purchase error and ErrorWell primitive [1e42a456](https://github.com/reservoirprotocol/reservoir-kit/commit/1e42a456ca42287dfd988f16a0836ea49fca8598)

## [v1.18.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/d026e3c8d7bbad5e9e54178ba6c79f56e348158a) (2023-11-08)

## [v1.18.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/70fc0c1bf13663745f086fe37145b2233de8b271) (2023-11-08)

* BuyModal: Disable cross-chain payment tokens [3d872206](https://github.com/reservoirprotocol/reservoir-kit/commit/3d8722068da9f3326adf57757e68faf5088c8185)

## [v1.18.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/e046f1bd94b3d7f719ed6bd56872e0eb17a62496) (2023-11-08)

* BuyModal: Add gasCost logic [27c5c0dd](https://github.com/reservoirprotocol/reservoir-kit/commit/27c5c0dd408d3b8cb53392f720bed82baedbeb2e)
* CollectModal: Sync api and add gasCost [575285ec](https://github.com/reservoirprotocol/reservoir-kit/commit/575285ecdafd9ac4e49c5df2c00f8fd6aefab585)

## [v1.17.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/21df44f0fd17ba8ff45952cf58e6b0c089515d7a) (2023-11-07)

* Fix default quantity sometimes being set to 0 initially [66abe09d](https://github.com/reservoirprotocol/reservoir-kit/commit/66abe09deb0fef30d4fa438f395ba21d3ea6fe69)

## [v1.17.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/599c765e34df0ecce1fad708c95cb76b32db60af) (2023-11-07)

* Improve tokenmedia fallback logic [03410e3f](https://github.com/reservoirprotocol/reservoir-kit/commit/03410e3f01a36c32ce8927fff899bdb559a732fa)
* BuyModal: Fix incorrect defaultcurrency [6d33fa22](https://github.com/reservoirprotocol/reservoir-kit/commit/6d33fa22bf829044e27be48d89694f2a5623b1fd)
* Improve crosschain transaction failure error handling [ba2c9736](https://github.com/reservoirprotocol/reservoir-kit/commit/ba2c9736661add665b8e89eaadd60ef644aca4f7)
* CollectModal: Fix incorrect default quantity [f90d1853](https://github.com/reservoirprotocol/reservoir-kit/commit/f90d1853563a9a493fad8baeecde7377babdc250)

## [v1.17.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/fd8dcca3c1a97547c2a562266d252bb73fc05759) (2023-11-06)

* Fix: update swr key for nativeBalances [edb87d23](https://github.com/reservoirprotocol/reservoir-kit/commit/edb87d23eda4ed9b3d589f95765959f833b9b1ca)

## [v1.17.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/f150275dad1aa5cd59890f4ce6f897f04094c0f0) (2023-11-06)

* Fix: Add currency conversions to paymentTokens dependencies array [34b4b88b](https://github.com/reservoirprotocol/reservoir-kit/commit/34b4b88b51a0b7c17b54d3e75fe2e847600f5fc5)
## [v1.17.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/18b82188e2faf7317f6ffeff7e81e773e6d05588) (2023-11-03)

* Cross chain Transactions [54beebcd](https://github.com/reservoirprotocol/reservoir-kit/commit/54beebcd5a520699260499c9ed7087570f6ef736)
* Standardize APIError by extending error and adding custom props [34ce97f2](https://github.com/reservoirprotocol/reservoir-kit/commit/34ce97f2f0c2092320ad66e4bb06c7ca9df148ac)

### Breaking Changes:
* Errors are now standardized, please check for any custom error handling from the SDK/client actions.
* Payment tokens now require a chainId to be specified

## [v1.16.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/b6cdb7327075859d9d06e00fda007c8ecac6fd8c) (2023-11-02)

* CollectModal: add usePermit prop [dd82d674](https://github.com/reservoirprotocol/reservoir-kit/commit/dd82d6741eabb712bc787242434f1fa63a64d5b6)
* BuyModal and BidModal: add usePermit prop [fd80d39d](https://github.com/reservoirprotocol/reservoir-kit/commit/fd80d39ddbc44201a05a8edbc673e40bd89253a1)

## [v1.16.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/7aa430e37a3519eb77a432072d8f16c53c4bb06d) (2023-11-01)

* BidModal: fix walletClient not being passed to renderer [7f17ed3f](https://github.com/reservoirprotocol/reservoir-kit/commit/7f17ed3f7d12de5146035a898d36e0493451315b)

## [v1.16.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/3ae515e1c544a2a9964a826336f0ef6be38cbab8) (2023-11-01)

* Add walletClient prop to modals and add to cart provider [cc827f2f](https://github.com/reservoirprotocol/reservoir-kit/commit/cc827f2fc3b6453521a963ec619ce6a74e0702db)

## [v1.15.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/671af6f970b343527e1ba24d69b4d0c9154532f2) (2023-10-31)

* ListModal: fix fee bugs [abec457b](https://github.com/reservoirprotocol/reservoir-kit/commit/abec457b179152df8d0b311f4b99a7a24b81ab31)
* BuyModal: Add purchase currency selection functionality [91c0d6ad](https://github.com/reservoirprotocol/reservoir-kit/commit/91c0d6ad36f4b8d1db29779964d58e1191b55ce9)
* CollectModal: Fix 1155 mint supply bug [6a63031c](https://github.com/reservoirprotocol/reservoir-kit/commit/6a63031c9aeee75c8c32d2ac29c3b1cdcf2746fa)
* Fix issue when payment token conversion is 0 [5f4ea7be](https://github.com/reservoirprotocol/reservoir-kit/commit/5f4ea7bebfa83bb245eae3e88cbacb745424743d)
* Fix feesOnTop in BPS not working with small percentages [13fa0f08](https://github.com/reservoirprotocol/reservoir-kit/commit/13fa0f08080c8e3b2133465463e6a7543ca6fdd3)
* Fix loading ui bug when token is refetched [498dc7ac](https://github.com/reservoirprotocol/reservoir-kit/commit/498dc7acc000ad8385c821c1acb8d182fcf2eb04)

## [v1.14.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/2e0da48aace205a516f505f96ae06518e8468982) (2023-10-30)

* Fix attribute selector ts errors after upgrading hook [fbc1ffd8](https://github.com/reservoirprotocol/reservoir-kit/commit/fbc1ffd83aab237ee89e786c5033b3cee40d2a9e)

## [v1.14.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/d9e91bb8e9759cb2c7d22db8f701b41b1065df30) (2023-10-30)

* Handle original listing currency [4320e927](https://github.com/reservoirprotocol/reservoir-kit/commit/4320e927838b38bbf29ac0a41a17dd2ed414aeba)
* ListModal: OrderKind override for listing [7b116eef](https://github.com/reservoirprotocol/reservoir-kit/commit/7b116eef5d90893a11e998e61ca2cfd9a130febd)
* BidModal: support orderKind prop [b863ab02](https://github.com/reservoirprotocol/reservoir-kit/commit/b863ab029e67bc81ad80fc329dd3c48026b1a4b8)
* Upgrade wagmi to v~1.4.3 and viem to v~1.16.3 [38611577](https://github.com/reservoirprotocol/reservoir-kit/commit/38611577d63a546c02b135b92b4a7b9868486ed7)
* Add alwaysIncludeListingCurrency flag [b8d6dad8](https://github.com/reservoirprotocol/reservoir-kit/commit/b8d6dad824aa7a9a90d4ca4b1ffbc3c078799fdc)

## [v1.13.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/9b9a97a613e99cc12bca61f0d9db30a8aa3ba0fc) (2023-10-27)

### Breaking Changes:
* Update useAttributes hook [8bd954e2](https://github.com/reservoirprotocol/reservoir-kit/commit/8bd954e2f768ecb42f60a07075cf46b5475c3570)
  1. A new parameter displayCurrency - returns the price in a given currency
  2. floorAskPrice now returns an object. Previously returned a number.

## [v1.12.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/407d390d9949777343fc625becb5056e71a9c6e2) (2023-10-19)
* Bump version to update SDK

## [v1.12.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/eb50f080518c76253f966eef6cdd658e446db536) (2023-10-19)

* Add scroll chain [4d8e05b8](https://github.com/reservoirprotocol/reservoir-kit/commit/4d8e05b8b0ff27558541b3cc97f7b4c85ed4ca0e)

## [v1.12.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/6ca77f1588fcaf4c41bec614f549b7116583a7e3) (2023-10-18)

* Fix broken import in EditListingModalRenderer [51f7a43f](https://github.com/reservoirprotocol/reservoir-kit/commit/51f7a43f8edfe6516a41bc286fe62c68ae471c12)
* Fix feesOnTopUsd bug in collect modal [ec631cab](https://github.com/reservoirprotocol/reservoir-kit/commit/ec631cab53b94cabd2ad119d2e20aed3e938390b)

## [v1.12.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/b4b2a91a1a1942f03260b72c820326c063477049) (2023-10-16)

* Add chain icons to all modals [ea3942b5](https://github.com/reservoirprotocol/reservoir-kit/commit/ea3942b5b02843be242067d1a24c23c39bbae6f0)

### Breaking Changes:
* Remove cross listing from ListModal in favor of Reservoir-only listing

## [v1.11.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/bc9ea4bddb80be047da7a3abd5f9eeafd153e0d7) (2023-10-12)

* Improve AcceptBidModal's unavailable ui [5ab15807](https://github.com/reservoirprotocol/reservoir-kit/commit/5ab1580734376470efca3e69642811c70a7d69dc)

## [v1.11.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/7d8a57c1ae608fbec38e73892efe77bf17de000e) (2023-10-06)

* Fix custom chains currency detection [d0314b21](https://github.com/reservoirprotocol/reservoir-kit/commit/d0314b210b1fb880c2162eea328cfcb834a3d38b)

## [v1.11.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/bc866f8c4267598acf6bd54efeae47b75752a748) (2023-10-06)

* Update A8 testnet WETH [bf41b19b](https://github.com/reservoirprotocol/reservoir-kit/commit/bf41b19b596bc8416dade1b1317000bfe06401aa)
* Disable link jumper with flag [9fbf32b9](https://github.com/reservoirprotocol/reservoir-kit/commit/9fbf32b9953aaa50f7cc3ad2f30be2f383bfec89)

## [v1.11.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/7e913c881f274449ba29cf7403d2ceb8f66f0d72) (2023-10-05)

* Improve transaction observability to reduce dependency on RPC [9347f698](https://github.com/reservoirprotocol/reservoir-kit/commit/9347f698ef341df963efe9396cdef5a06ee08bab)
* Bidmodal: use supported marketplaces api to select the right exchange (orderKind) and follow restrictions [f3896827](https://github.com/reservoirprotocol/reservoir-kit/commit/f3896827fa2ad4265f0d954048961c66ed4c9a5f)

### Breaking Changes:
* All custom modals now defer the handling of errors to the UI, while now providing more explicit errors

## [v1.10.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/819d348bf4dd526dfec6b6d779d0a518031232e6) (2023-10-04)

* CollectModal: Purchase currency selector [e619f299](https://github.com/reservoirprotocol/reservoir-kit/commit/e619f299af3b5cf5ac8cbacc7d51cb61824903dd)

### Breaking Change Migrations:
* apiKey moved to root configuration object, no longer required on every chain configuration.
* CollectModalRenderer: Changes to state parameters passed from renderer

## [v1.9.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/12d26b9567d7c5242ca748c1e778f9cff87e93ea) (2023-10-03)

* Update a8 testnet weth address [1b9332a4](https://github.com/reservoirprotocol/reservoir-kit/commit/1b9332a4b30f3ad95c9a5ead9768307dfc2e894b)

## [v1.9.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/74b3e4195905f3ac7a6eb2ca7b22a0da137fae57) (2023-10-02)

* Add ancient8 chain [55dfc452](https://github.com/reservoirprotocol/reservoir-kit/commit/55dfc4525a38e762f16e02d983b103047b94589a)

* CartPopover: Fix insufficient balance currency icon [a559ae0e](https://github.com/reservoirprotocol/reservoir-kit/commit/a559ae0e89f0b1562f6304e4e7d1da77d34700e7)

## [v1.9.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/cc38ed3743ea081bb7fd25277e54a2b68aea4bf9) (2023-09-25)

* ListModal: Fix Creator royalty updating to wrong value when listing 721c [63d94241](https://github.com/reservoirprotocol/reservoir-kit/commit/63d94241966816bc91b8c3f1d60a9d5d1488cbf1)
* CollectModal: Fix issue with disabled button after disconnecting [8ad67182](https://github.com/reservoirprotocol/reservoir-kit/commit/8ad6718245f774617ea1c48b2a1492a75645d02a)
* Update all modals with ErrorWell logic [2608641c](https://github.com/reservoirprotocol/reservoir-kit/commit/2608641c69bd183632e663deb0aef7b4c55b38ed)


## [v1.9.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/d19b2b186a9935e29dc837d48d725a23d24abef8) (2023-09-21)

* BidModal & ListModal: Fix retry logic [15763bd7](https://github.com/reservoirprotocol/reservoir-kit/commit/15763bd7123259ab28314ab928e6671b5c45fec0)

## [v1.9.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/f5118f9eebd85c2caf7214e523a82b35091c4076) (2023-09-21)

* BuyModal & CollectModal: Allow opening without being connected [8beb0787](https://github.com/reservoirprotocol/reservoir-kit/commit/8beb078737d25fc341f144486016e31b05780219)
* Improve "User Rejected" error [4d6d132b](https://github.com/reservoirprotocol/reservoir-kit/commit/4d6d132b0e6c86dde8a5e3ea4352cd0d62019505)
* Add zkEVM WETH details [801b2ad7](https://github.com/reservoirprotocol/reservoir-kit/commit/801b2ad7d1e858df3d21efba695b2e1fca2c6b8f)
* CollectModal: handle sweeping 721c tokens listed in a different currency [21ab7c26](https://github.com/reservoirprotocol/reservoir-kit/commit/21ab7c263516004ad933208ef241b901c468e980)

## [v1.8.6-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/758b2b703b9a7a64ef0be8d583f01b1460d89b34) (2023-09-18)

- Update SDK

## [v1.8.5-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/c590e29a6b5786b999705e95ff1e35c61c131d1e) (2023-09-14)

* ListModal: only get supported marketplaces when modal opens [8934742](https://github.com/reservoirprotocol/reservoir-kit/commit/893474210208030c78282c226656fe287cd8f3ec)
* ListModal & BidModal: retry button should switch chanins if necessary [abaeb81](https://github.com/reservoirprotocol/reservoir-kit/commit/abaeb81465a450c7aede774d727eb5248828e7f2)
* ListModal: Remove outdated opensea fee logic [ff0e0ca](https://github.com/reservoirprotocol/reservoir-kit/commit/ff0e0cafd8000de016e3a4bde1ee6b8a12dd4510)

## [v1.8.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/c2993841994af0cfca0b452a873b547ecb70978a) (2023-09-07)

* Allow chain override for all modals [7395dca](https://github.com/reservoirprotocol/reservoir-kit/commit/7395dca643167b3aed8294fc741b5de4616b95c3)
* CollectModal: fix sweeping 1155s quantity [63ea43a](https://github.com/reservoirprotocol/reservoir-kit/commit/63ea43af5518d01f9cfda6d6f891c4d98707f627)
* ListModal: fix collect floor stat [2068d4b](https://github.com/reservoirprotocol/reservoir-kit/commit/2068d4b7449b18e5cd4f139991a5f370473777bd)
* CollectModal: format quantity available [abfd250](https://github.com/reservoirprotocol/reservoir-kit/commit/abfd250b738475f64077eaa42b35347da8ccbaee)
* Add zksync wrapped contract details [54d24d9](https://github.com/reservoirprotocol/reservoir-kit/commit/54d24d94daefb0409f1b76f5f1768430237fd1fc)
* useCollections: Update collections/v6 to v7 [38ecc5a](https://github.com/reservoirprotocol/reservoir-kit/commit/38ecc5a922e31d8e38792d0bc11eed74ebb4e0f4)

## [v1.8.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/674519e6a257ac070c76d97ce2795c602adf4729) (2023-09-06)

* Make wagmi a peerdependency of RK ui [98b10b7](https://github.com/reservoirprotocol/reservoir-kit/commit/98b10b71f5eca78c12200faf8e452c6cdd5d012d)

## [v1.8.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/3cbb2c2078ddada9ae521073d1538811861df6f8) (2023-09-05)

* Round down to avoid decimals when calculating bps feesOnTop [dfeb7ce](https://github.com/reservoirprotocol/reservoir-kit/commit/dfeb7ce84701e6bb6ab6f3c9b825dd487fea6ac8)
## [v1.8.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/0c2f43c7007d025cb37d71d0fc3bc604cbf45038) (2023-08-31)

* CartPopover: Tweak theme keys to be more configurable  [a2bf151](https://github.com/reservoirprotocol/reservoir-kit/commit/a2bf15103613f1783d654f64d55e5b01506e7cad)
* useCollections: Upgrade from v5 to v6 [f0a48a0](https://github.com/reservoirprotocol/reservoir-kit/commit/f0a48a01bded05b42836e7459ddbcefd6e40f6e6)
* BuyModal: fix unavailable title when token is still loading [edb0190](https://github.com/reservoirprotocol/reservoir-kit/commit/edb0190fdeba6f4e113080428e024c511d765ab2)
* TokenMedia: add support for m4a audio and mov video [1880983](https://github.com/reservoirprotocol/reservoir-kit/commit/1880983dab9b787bb6489090c95282378dbcde4a)
* TokenMedia: handle updated media url [8a5c4dd](https://github.com/reservoirprotocol/reservoir-kit/commit/8a5c4ddaaa15f34ef6f478da9762ee908f72efa5)

## [v1.8.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/db1492a2f9847a2969180d4900af918ef5d070d3) (2023-08-30)

* Setup different exports based on the import flavor [ba5608d](https://github.com/reservoirprotocol/reservoir-kit/commit/ba5608d235ff57f2578d070f316cb4d83a6015f4)

## [v1.7.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/735e51af07171ff0a27a2fb3d42a56d1c63846e9) (2023-08-30)

* Add bounty referrer global parameter for purchasing [82efe58](https://github.com/reservoirprotocol/reservoir-kit/commit/82efe58df8d6335bdc1f9b7c593405b5224ac82a)

## [v1.7.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/cd75fbc492a848c4ac21e4808838777dfc56393c) (2023-08-28)

* Upgrade wagmi [ typescript](https://github.com/reservoirprotocol/reservoir-kit/commit/2023-08-21)

## [v1.6.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/480f4a718e8ad9969dfe6a006fdfd2eb1c133211) (2023-08-25)

- Sync Api

## [v1.6.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/2e9f33cb50e6669a0f2e5629e80c2415c24a7450) (2023-08-22)

- Improve error messaging to surface more information from API errors

## [v1.6.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/ee2879767381dfb023aa3ec054058a13e55a9a56) (2023-08-21)

- [BREAKING]: Improve expected price check [cc83f1a](https://github.com/reservoirprotocol/reservoir-kit/commit/cc83f1a6b0f5b952eb5e9b567b735d314819b120)
- CartProvider: cart checkout modal fix success message [bc63cc9](https://github.com/reservoirprotocol/reservoir-kit/commit/bc63cc974edae7ae746c59582d6da4bbbc3ea4be)

## [v1.5.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/93d9eba98c9157b2d1ea90f93ad8d71b842cd684) (2023-08-18)

- Update manifold contract address for goerli [ea956bf](https://github.com/reservoirprotocol/reservoir-kit/commit/ea956bfd7452503bf88ecf5c006b88de898baed8)

## [v1.5.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/d2f984d7d895909ddd62be1dbaab07e4e03d8f62) (2023-08-18)

- Update manifold contracts [2c89c4a](https://github.com/reservoirprotocol/reservoir-kit/commit/2c89c4a3c028ba339fdffdd47e25a18dc10237c2)

## [v1.5.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/73392b542bd097f00fcf68558e13221fc5c9875f) (2023-08-11)

- useUserTopBids update from v2 -> v4 of the api [596c732](https://github.com/reservoirprotocol/reservoir-kit/commit/596c732d9e843334f6e0b2400993f6f2c91d9b04)
- BuyModal & Cart: Update successfull/failed purchases logic [38def47](https://github.com/reservoirprotocol/reservoir-kit/commit/38def47379182dcc304eb67c31275de99f596196)

## [v1.4.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/588afefec402669059780df6f291b300045ece30) (2023-08-03)

- Upgrade useBids hook to v6 [37247fd](https://github.com/reservoirprotocol/reservoir-kit/commit/37247fdac7d57be294b3e7b4daf456ebc0ef5052)
- Upgrade useListings hook to v5 [30134c3](https://github.com/reservoirprotocol/reservoir-kit/commit/30134c384a627be127221e52f21fe0c28cbfd8c9)
- CollectModal: Display fees for mints [d30d0ee](https://github.com/reservoirprotocol/reservoir-kit/commit/d30d0eea6d19073fc86a7543113fe1ea1bb2c7d1)
- CartProvider: add support for usd based fixed fee [8a3924a](https://github.com/reservoirprotocol/reservoir-kit/commit/8a3924afd9edbeca7270bbb4c1bfab0e663b2b65)
- CollectModal: add support for usd based fixed fee [573357d](https://github.com/reservoirprotocol/reservoir-kit/commit/573357d558357c09175f2ddba686a31f49ee8193)
- BuyModal: add support for usd based fixed fee [ed3a2cd](https://github.com/reservoirprotocol/reservoir-kit/commit/ed3a2cdf765c30e48db2395edcd0d77b5dc6a0e0)

## [v1.3.9-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/e51b91d48a59711358969fcfd54dcef2f3c06d4d) (2023-08-01)

- Dont override ids if already supplied [8755396](https://github.com/reservoirprotocol/reservoir-kit/commit/87553965b05b311cceac3fac58a24910bc013ba2)

## [v1.3.8-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/a560cb5ff73c2bc236b5278e1632d94e72b1dad0) (2023-08-01)

- Patch coingecko currency filter deprecation issues [cdff5f7](https://github.com/reservoirprotocol/reservoir-kit/commit/cdff5f76151755b382157e6395ba2011d0a88f8a)

## [v1.3.7-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/78209784c74a7c042bfb512b7b7edf7467549cb1) (2023-07-31)

- Patch when purchasing always supply the currency address [76e79c5](https://github.com/reservoirprotocol/reservoir-kit/commit/76e79c506a06963b305ce908d19bd136f5adb4f5)
- Remove hardcoded paths [a583a3d](https://github.com/reservoirprotocol/reservoir-kit/commit/a583a3d931af2623217742432a77fa4db9df7589)

## [v1.3.6-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/7a6d719b8139a02cf40b04f1448e872d7eba410c) (2023-07-28)

## [v1.3.5-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/5e6e37028c27b325fd78603718e08cb05d5f94ca) (2023-07-28)

- Add linea chain details for wrapped contract [b77abfd](https://github.com/reservoirprotocol/reservoir-kit/commit/b77abfd2579acc482d2c777abb0614541fd9cbf2)

## [v1.3.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/d2fadca0fe6d761237c7ff1c224ff116f0dc57b0) (2023-07-25)

## [v1.3.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/6420f86ce0fb2eeb3b90dffcd74d005f6f5f498f) (2023-07-21)

## [v1.3.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/a5aecfc56e5e6cda53fd3a53f1496c6e7c9199d2) (2023-07-21)

- Update Arbitrum Nova wrapped contracts [5c09ede](https://github.com/reservoirprotocol/reservoir-kit/commit/5c09edeb9fac7f1469026331b8d9bfb0778877ce)

## [v1.3.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/30b452f63dea8b1095061a795ffd9e21d4837543) (2023-07-20)

- BuyModal: Patch bug where decreasing the quantity causes unavailability [6112855](https://github.com/reservoirprotocol/reservoir-kit/commit/61128558d0d3b63b3355134d1d5bda10b43f59ea)
- CollectModal: Fix successful/failed count for 1155s [2023-07-19](https://github.com/reservoirprotocol/reservoir-kit/commit/88ad703)
- CollectModal: Update 1155 max quantity logic and total calucaltion [19102b0](https://github.com/reservoirprotocol/reservoir-kit/commit/19102b03bcedf160a2fb88f1b63c39cbbd67c4f6)

## [v1.3.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/7092d495b509ceb3b4bed05dbf860e6acb92140d) (2023-07-18)

- TokenMedia: fallback to IPFS if metadata images missing [b1b0156](https://github.com/reservoirprotocol/reservoir-kit/commit/b1b01568660f8675206a808ecedd09e1032e53ca)
- Fix token checkout usdPrice when undefined [a5b0447](https://github.com/reservoirprotocol/reservoir-kit/commit/a5b0447b783d29e3d690d20c789c1719b8d92f16)
- CollectModal: Fix copy for multiple approvals [6045ef7](https://github.com/reservoirprotocol/reservoir-kit/commit/6045ef725840294a2f12f1e1344b9fe139e8c672)
- Add avalanche wrapped currency [16db37a](https://github.com/reservoirprotocol/reservoir-kit/commit/16db37a1ca9508fbb5024d1dd4a3843a20c83955)

## [v1.2.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/b557a40f0f86cdc5a6b94d633a9bb18d833633b5) (2023-07-17)

- Add base to wrapped contract names and address [179a1eb](https://github.com/reservoirprotocol/reservoir-kit/commit/179a1eb3e57e6e75193acde9491f8a5fd5c54d75)

## [v1.2.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/20a3b39a931b23d60fbb4edd0952f0331c552679) (2023-07-14)

- Disabled quantity selector in bid modal for 1155s with supply of 1 [75af60e](https://github.com/reservoirprotocol/reservoir-kit/commit/75af60ebf3f097b4ef916737e4dcc9894f72bbf4)
- Add sweeping support for 1155s [ update ui](https://github.com/reservoirprotocol/reservoir-kit/commit/2023-07-12)

## [v1.2.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/22470fe5a89bcaa1dda4cefd36630127e35956fc) (2023-07-07)

- Fix type definitions for Custom Bid/EditBid Modal [a68e029](https://github.com/reservoirprotocol/reservoir-kit/commit/a68e029847638af164993c98f373de82819c0700)
- Fixed price text wrapping issue [d675b1a](https://github.com/reservoirprotocol/reservoir-kit/commit/d675b1ad24a1c2956cf54c63f9a4e698603faf31)

## [v1.2.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/7400eca4cc80d6c522e765935be7430d791ed200) (2023-07-05)

- Combine Sweep Modal and Mint Modal into CollectModal [7bd8949](https://github.com/reservoirprotocol/reservoir-kit/commit/7bd894992ee7d895a66c49963366eb05adc7d589)

- Refactor fees to support multiple recipients [9e58560](https://github.com/reservoirprotocol/reservoir-kit/commit/9e585606638484da52c89bdb8745d9a7d04608c3)
- Changed bidInput to bidAmountPerUnit [730c9f8](https://github.com/reservoirprotocol/reservoir-kit/commit/730c9f8fc59fce2b6fc1a8001186ec445702aad7)
- Fix bug when itemAmount is undefined [6e66cc9](https://github.com/reservoirprotocol/reservoir-kit/commit/6e66cc9fb76bf77aba1bf13225f262cdcd9e67a2)
- Add quantity to the bid modal for collection/attribute offers and 1155s [c785a73](https://github.com/reservoirprotocol/reservoir-kit/commit/c785a73c3fc3e4ff2eba5931b234823d2db2d3b5)

## [v1.2.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/af6a55c31bbd9748c789e1ab2bd39082ce50003b) (2023-07-03)

- ListModal: override marketplace fees [349a14c](https://github.com/reservoirprotocol/reservoir-kit/commit/349a14c29e73b14d874925506bfc1ab9a696f020)
- BidModal: Add feesBps prop [46f021e](https://github.com/reservoirprotocol/reservoir-kit/commit/46f021ee981783107a09d551c79125e07163d3cd)
- CartProvider: Refactor fees and add global referrer fees [0023b9a](https://github.com/reservoirprotocol/reservoir-kit/commit/0023b9a1642d51cb0ad4f5fbc70196afa5cf2f5e)

## [v1.1.14-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/afc556946e46dfb212ec77ecc8903a5e6e85c6af) (2023-06-29)

## [v1.1.13-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/1c2d07ce6f219dc68f35344b7e158b2d8f457ce3) (2023-06-28)

- Add bnb wrapped contract configuration [798a02d](https://github.com/reservoirprotocol/reservoir-kit/commit/798a02dce17d451b8ce45abfad5466dfcf0c83cc)

- AcceptBidModal: use netamount to check expected price [d9533d2](https://github.com/reservoirprotocol/reservoir-kit/commit/d9533d2c3f80d69132a60ddcfb26a39ba9bf9f8c)
- ListModal: Use new payment tokens property from supported marketplaces api [7d536a4](https://github.com/reservoirprotocol/reservoir-kit/commit/7d536a4a6e65c7e022fbedc8ad844566ebd69f1b)

## [v1.1.12-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/18e39c372780963ae26f5a227c4202371d309046) (2023-06-27)

- Upgrade Viem & Wagmi Peer dependencies [0dddd11](https://github.com/reservoirprotocol/reservoir-kit/commit/0dddd1191f59f61929ba1551c9dd5491ac22d6d9)

## [v1.1.11-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/080732333722213800b5621c8f4574b937426508) (2023-06-27)

- EditBidModal and EditListingModal: Fix collection range issues [bd21a95](https://github.com/reservoirprotocol/reservoir-kit/commit/bd21a9599eee7483d0657b1bdfda7bfb9b6aeefb)
- AcceptBidModal: Fix token range lookups [c71f432](https://github.com/reservoirprotocol/reservoir-kit/commit/c71f432b8ddf90d16d2327516dc8dc04ae87b480)
- Add payment token logic for opensea listing in non native currencies [630f60b](https://github.com/reservoirprotocol/reservoir-kit/commit/630f60b72d011c11617702d802569d187773a0aa)
- Use net amount when checking expected price quote for selling [ddad809](https://github.com/reservoirprotocol/reservoir-kit/commit/ddad809b6c98a72b709de1694d28a61e4ef70fd7)
- Upgrade viem to ~1.0.6 [ rainbowkit to ^1.0.3](https://github.com/reservoirprotocol/reservoir-kit/commit/2023-06-26)

## [v1.1.10-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/2eefe64cd5bdbad5d4a2c4a8f13727cb5eac2895) (2023-06-22)

- Update Powered by Reservoir modal footers [6ae1ad6](https://github.com/reservoirprotocol/reservoir-kit/commit/6ae1ad68d4e58121f0134b2afd95d0ebbae91449)
- Buymodal: Redirect users to lifi when add funds is clicked [2ad5fa2](https://github.com/reservoirprotocol/reservoir-kit/commit/2ad5fa223e326b67505b25bf707a935394a939cc)

## [v1.1.9-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/4b2343dc6e999c23ef9742383d46668f7054aa44) (2023-06-21)

- Add custom chains to fix zora chain transaction detection [4ae8067](https://github.com/reservoirprotocol/reservoir-kit/commit/4ae80673209df5f06ae45403784d4407b1f176f0)

## [v1.1.8-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/400f027c8e2eb46746b36862c45d660713a38036) (2023-06-20)

- Fix export issue [a0450b2](https://github.com/reservoirprotocol/reservoir-kit/commit/a0450b297986b74da5548ddb6ee39d9ec1eaf984)

## [v1.1.7-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/fa3c46cd797fe9570b21e895ed21691ad5a06cde) (2023-06-20)

- ListModal: Fix bug with oracle enabled fees not displaying properly [f8a591a](https://github.com/reservoirprotocol/reservoir-kit/commit/f8a591a11e547e152be4772f5601c956da16898b)
- Fix sweep modal bug when slider breaks when using 'by ETH' for small amounts [a5a6e93](https://github.com/reservoirprotocol/reservoir-kit/commit/a5a6e93a9de93d70cbd4744f99c986733a615a65)

## [v1.1.6-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/94ae52b7f7b0a0dcd09e775cb2072c9ae0db7ada) (2023-06-16)

- Post results to execute results when signing transactions

## [v1.1.5-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/4f30eb8a8663f324e47f3ea3757a15c43bdf8119) (2023-06-13)

- Upgrade viem dependency to ~0.3.35 [8450dd9](https://github.com/reservoirprotocol/reservoir-kit/commit/8450dd9186dd50222dfc0d4f485c874553475fcb)
- BuyModal: Fix issues with 1155 multi buy [a8866c1](https://github.com/reservoirprotocol/reservoir-kit/commit/a8866c10ccb6bdd7f819413334909163fb610ce0)

## [v1.1.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/98620013a6d7768ee76bc0fb7bb4b9dd918ef933) (2023-06-12)

- Reduce token image sizes to improve performance [c149e06](https://github.com/reservoirprotocol/reservoir-kit/commit/c149e0650faf31a8c5173a9675a910d385cd292c)

## [v1.1.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/878ca89a048ac81307fed32be8866450b50929cf) (2023-06-12)

- Update SDK

## [v1.1.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/a60d63eb565ced9d8a4f8adcd3022a6a398fea05) (2023-06-09)

- Update SDK

## [v1.1.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/8fd414ce9a939ba11ad62de163462e4e6ef8606b) (2023-06-08)

- Update SDK

## [v1.1.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/3989fa9e5cea1e2188609ca1e036c3eca0bd283d) (2023-06-08)

- Strip out flagged status api calls [9afae7f](https://github.com/reservoirprotocol/reservoir-kit/commit/9afae7f3e3bd9eb1ddcc2eef33913cc18530345d)
- Allow customizing modal title and CTA copy [26fec99](https://github.com/reservoirprotocol/reservoir-kit/commit/26fec999129fa320517fe9655bb469224c157520)
- Block adding multiple listings of the same 1155 token from the same maker [b309cd8](https://github.com/reservoirprotocol/reservoir-kit/commit/b309cd8562c18c1f4f9f192b0c097993cd855534)
- Upgrade radix libraries to latest [53a1801](https://github.com/reservoirprotocol/reservoir-kit/commit/53a180187befc037ed3e9e40ee7eef9bff24a742)

## [v1.0.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/fdb6d652d5864cbca64f1000b3a68b328e55939d) (2023-06-07)

- Handle sweep price changes [4955f8c](https://github.com/reservoirprotocol/reservoir-kit/commit/4955f8c20d7bf75603be3354554fffc211a59b2e)

## [v1.0.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/24b0975b8ae9b6b5946402b5ced4d8b44fb50058) (2023-06-06)

- Add weth contract for zoratestnet [508a190](https://github.com/reservoirprotocol/reservoir-kit/commit/508a19001309d97d038f4d782ea4d663b0ae7d21)
- add wrapped contract details for testnet chains [745c17e](https://github.com/reservoirprotocol/reservoir-kit/commit/745c17eaaeafb7c00a6c74a7406eab0583af954a)

## [v1.0.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/18b91b6b5bc879b270b3d31452b061a45ed10d37) (2023-06-02)

- Fix bid quantity total calculating in custom modal [4022c80](https://github.com/reservoirprotocol/reservoir-kit/commit/4022c80fb37a8197dfed85a82959172219bfdb99)
- Transaction result ui in Sweep/CartCheckout modals [933e906](https://github.com/reservoirprotocol/reservoir-kit/commit/933e9065b3fbc1c73dc5f5efa2b1edc274746b14)
- Add fee variables to sweepTokens dependency [2023-06-02](https://github.com/reservoirprotocol/reservoir-kit/commit/ae4f16c)
- Fix: bps takes precedence over fixed fees [e88b60a](https://github.com/reservoirprotocol/reservoir-kit/commit/e88b60a84d5f18989b9ccd774c9f1c4670731ed5)
- Merge pull request #239 from reservoirprotocol/armando/grwth-2504-partial-sweeping-1155s-in-the-buymodal [c2af048](https://github.com/reservoirprotocol/reservoir-kit/commit/c2af048fc86b1986259713414eec0ad399fc3d3f)
- Fixed price used for mixed currencies [e53ca06](https://github.com/reservoirprotocol/reservoir-kit/commit/e53ca069a54744a466c1212de655123ef9a87c03)

## [v1.0.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/9b3ad6057c63c7b1f44fd83c231644720a9cff3c) (2023-06-01)

- wip [6743ea7](https://github.com/reservoirprotocol/reservoir-kit/commit/6743ea79cd76c19e44aa8bfd9335d11c61ea6485)
- Fixed add by eth [bdcba34](https://github.com/reservoirprotocol/reservoir-kit/commit/bdcba341163fb7d9fbe0192923c6a3b688cdf952)
- Replace useTokens with execute/buy precheck [8948876](https://github.com/reservoirprotocol/reservoir-kit/commit/894887652e47d5065f08db77d788081c19944c41)
- Fix error message ui in sweep modal [44d5b2d](https://github.com/reservoirprotocol/reservoir-kit/commit/44d5b2d521ac5fda38cb6b66daa568549c3bbacf)

## [v0.18.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/a88545a1fab211f618d1a7c0efdbef0e4ad37cb2) (2023-05-30)

- Merge pull request #260 from reservoirprotocol/fixes/accept-bid-modal [9d55677](https://github.com/reservoirprotocol/reservoir-kit/commit/9d5567753d95ca96b559a6f0b50cfed5a83407a6)
- Merge pull request #259 from reservoirprotocol/pedro/grwth-2753-buymodalcustom-allow-for-feesontop-to-be-specified [e988a1c](https://github.com/reservoirprotocol/reservoir-kit/commit/e988a1c1647205fbc7a40513c831c4ffb56ad123)
- Fix some AcceptBidModal errors [041026b](https://github.com/reservoirprotocol/reservoir-kit/commit/041026bd98f8a0e6c81ad887095dc5bca063b7a7)
- Fix error in AcceptBidLineItem due to keys not set in repeatable elements [5218394](https://github.com/reservoirprotocol/reservoir-kit/commit/521839415941dfe678c7fe5269719a01fa491e36)

## [v0.17.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/9c4c7af78798d325f63b1f16ac39af62949ade80) (2023-05-27)

- Tweak BuyModal referrerFee props to support passing in multiple receipients and fees [b0bec2d](https://github.com/reservoirprotocol/reservoir-kit/commit/b0bec2d23ffbff6df811d8ed26377c259366c7f1)
- Add fees on top to BuyModalRenderer [4a22aed](https://github.com/reservoirprotocol/reservoir-kit/commit/4a22aedf16c82f052d17df1b4862d06552f0b0b9)
- Merge pull request #244 from reservoirprotocol/pedro/grwth-2551-support-batch-selling-in-rk [48d2ba4](https://github.com/reservoirprotocol/reservoir-kit/commit/48d2ba44c74877f353e1b38d0e6781aec1ca7408)

## [v0.16.9-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/223f3799815dd0e6586db5a4ac9be39440165a2a) (2023-05-25)

- feat: finalize [2dcc49f](https://github.com/reservoirprotocol/reservoir-kit/commit/2dcc49fe225662f2f16dea68583e58f964c780d8)
- feat: Updaete UI [0d64d94](https://github.com/reservoirprotocol/reservoir-kit/commit/0d64d94751da91ee1181984d83c884b0c74d347d)
- fixed default currency [2023-05-25](https://github.com/reservoirprotocol/reservoir-kit/commit/95d7a57)
- Allow passing in multiple currencies to the bid modal [b07de01](https://github.com/reservoirprotocol/reservoir-kit/commit/b07de01a1beb2f111dad2aab9dcd2a8d38ee1378)
- Fix issues with determining if a purchase was successful not when sweeping/selling/checking out the cart [e26ed64](https://github.com/reservoirprotocol/reservoir-kit/commit/e26ed6426a61039030d1c61ccfdfeee2f8bcef1d)
- Revert back to importing allChains from viem [47696f3](https://github.com/reservoirprotocol/reservoir-kit/commit/47696f3f25cccc4319e2b55cb0d509b89a7fe8ff)
- Got speeding up a transaction to work [f2aedb1](https://github.com/reservoirprotocol/reservoir-kit/commit/f2aedb101d7cbb4a04f92194ce4aca5ef9bb559e)
- Fix issue with accept bid modal not fetching bids when normalize royalty changes [5a13cbe](https://github.com/reservoirprotocol/reservoir-kit/commit/5a13cbe723c18a8e21c8ba384ced7ec2bd362da9)

## [v0.16.8-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/68c64f3595e18f44995e485a5201210d5c6ec985) (2023-05-23)

- Merge pull request #251 from reservoirprotocol/armando/grwth-2747-add-hook-for-activity-search [7acbc47](https://github.com/reservoirprotocol/reservoir-kit/commit/7acbc47b899d9b71bdf0e6a7ede24fb2653a0b8f)
- Merge pull request #238 from reservoirprotocol/armando/grwth-2582-use-opensea-testnet-api [b8023c0](https://github.com/reservoirprotocol/reservoir-kit/commit/b8023c0b0f55da699afec8b07f1777e35247fa6b)
- feat: Add false [80a1004](https://github.com/reservoirprotocol/reservoir-kit/commit/80a10041bb238f41eef3382346d7e45edc9365f5)
- feat: Fix options stuff [979479c](https://github.com/reservoirprotocol/reservoir-kit/commit/979479c3c7097b6034814e3047b1a30da39d9083)
- feat: Update search check [9b05e4c](https://github.com/reservoirprotocol/reservoir-kit/commit/9b05e4ce2d0bb9bae11de39a231b32ab83002ff3)
- feat: Export hook [a51f7c0](https://github.com/reservoirprotocol/reservoir-kit/commit/a51f7c0a7f4660a27e97b796bf29221772bf8607)
- feat: add useSearchActivities hook [cdb1043](https://github.com/reservoirprotocol/reservoir-kit/commit/cdb10438fd8c2325ef0064b9f26d699ec9c1710a)
- feat: More ids stuff [d62942b](https://github.com/reservoirprotocol/reservoir-kit/commit/d62942bfd6fc26c11ced57f1d0e64b3492036d28)
- Fixed signTypedData in executeSteps [2023-05-22](https://github.com/reservoirprotocol/reservoir-kit/commit/c2b71db)
- feat: pass id into UseTokenOpenSea [9fc1431](https://github.com/reservoirprotocol/reservoir-kit/commit/9fc1431a1f6372dc948425eeba57270099239991)
- feat: Use id in cartProvider [b9f6e88](https://github.com/reservoirprotocol/reservoir-kit/commit/b9f6e8881c9957bec8c2ad39b506798da67ab49d)
- Fix import issue with wagmi/chains and parcel [91e80f1](https://github.com/reservoirprotocol/reservoir-kit/commit/91e80f1870f5073b2301878e94e638a0aa589471)
- Fix http url error [53a1c73](https://github.com/reservoirprotocol/reservoir-kit/commit/53a1c73ad0261bbc2fe9b9d8e971c9a56cf808a0)
- moved wagmi to peer dependencies [2023-05-16](https://github.com/reservoirprotocol/reservoir-kit/commit/ae63a9c)
- attempting to fix build errors [52ec0f9](https://github.com/reservoirprotocol/reservoir-kit/commit/52ec0f976073baf041cee1995649c414976b78c8)
- removed ethers from demo [2023-05-16](https://github.com/reservoirprotocol/reservoir-kit/commit/a6e5e69)
- updated format currency comnponent to use bigint [c3c2751](https://github.com/reservoirprotocol/reservoir-kit/commit/c3c2751d5863ca7fb41d9b622091f91864d31820)
- resolve conflicts [5a48f36](https://github.com/reservoirprotocol/reservoir-kit/commit/5a48f36a459b9b31ce0b8fdbb497043e1e17a737)
- wip [ffbdcaf](https://github.com/reservoirprotocol/reservoir-kit/commit/ffbdcaf018b247209cb3b25da889f36217d16bf0)
- upgraded wagmi and rainbowkit in demo app [11082b5](https://github.com/reservoirprotocol/reservoir-kit/commit/11082b5db10cc3bf2660b4f4286da8bdfb4ff307)
- Batch selling in the AcceptBidModal [d1ad38b](https://github.com/reservoirprotocol/reservoir-kit/commit/d1ad38b57db27ff583f77502c1c89fa612cbef69)
- feat: Formatting [bef2b2f](https://github.com/reservoirprotocol/reservoir-kit/commit/bef2b2f9781f9ca708d1c9c8a8e01f80e223d400)
- feat: Update map [783408c](https://github.com/reservoirprotocol/reservoir-kit/commit/783408cd09562f6323fce0957fa6458e02944b97)
- wip batch accepting bids [dac02e1](https://github.com/reservoirprotocol/reservoir-kit/commit/dac02e1f319ccbfa4aaccf6e299f6d2dfa30df5e)
- feat: Add override [d69c290](https://github.com/reservoirprotocol/reservoir-kit/commit/d69c290ee8cecd02ccf01321ddbce4130f521d52)
- feat: Resolve review [de5cc74](https://github.com/reservoirprotocol/reservoir-kit/commit/de5cc74d6662d9768f136ed1ab8aba440aba03f0)
- feat: Partial styling [fe4c9e1](https://github.com/reservoirprotocol/reservoir-kit/commit/fe4c9e1b6e6dd0adad2f28db49b8b079533c9727)
- feat: Add tx map [a4c12f5](https://github.com/reservoirprotocol/reservoir-kit/commit/a4c12f5b95bd8f6e10be404dd15e2b630e233178)
- feat: Remove logging [eb4686d](https://github.com/reservoirprotocol/reservoir-kit/commit/eb4686d8958b74e1caa93f9b78c8e765a2a47460)
- feat: Update use partial options [b1d3d3a](https://github.com/reservoirprotocol/reservoir-kit/commit/b1d3d3ac1ea233985999312db37292be2d757dcd)
- feat: Partial logic [27a01a8](https://github.com/reservoirprotocol/reservoir-kit/commit/27a01a8624fa8a26fa2d5727bd8aa7576d575968)
- feat: Hardcode chain value [f2ef440](https://github.com/reservoirprotocol/reservoir-kit/commit/f2ef440dd1541ebe6f720be92404b36a82262a33)
- feat: Use testnet api on goerli [ee898e0](https://github.com/reservoirprotocol/reservoir-kit/commit/ee898e09b9b4c2e8fbff1784983ddd1cebeb0c4e)

## [v0.16.7-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/75011b90a46da0cf7ed171c39dde775c88240efa) (2023-05-18)

- Display prices for mints in activity [874fd2e](https://github.com/reservoirprotocol/reservoir-kit/commit/874fd2e51b136491df7d85eecf56e02536ff725f)

## [v0.16.6-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/26850598e5a0b2986e9952aa591154768130c299) (2023-05-16)

- Upgrade to v5 userTokens [b84233b](https://github.com/reservoirprotocol/reservoir-kit/commit/b84233bdf467f335cf9b97cfb7aecb9f4255f526)

## [v0.16.5-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/a055f25e07a3fd4deba30e94a61c612f041b24ac) (2023-05-15)

## [v0.16.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/6a64e398e55d3d994218fda2365432e3d3b71319) (2023-05-15)

## [v0.16.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/718f297c145b240df931902940a8a3fbacbdb4e6) (2023-05-11)

- feat: Update property [da2f8a2](https://github.com/reservoirprotocol/reservoir-kit/commit/da2f8a213cd07be994043b3b123e93b6219c6ffe)

## [v0.16.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/94282cc33a064d42a37c6b33e6dec27aacad042a) (2023-05-09)

- Fix referrer fee bugs in BuyModal and CartProvider [e29b85f](https://github.com/reservoirprotocol/reservoir-kit/commit/e29b85fa306f5bbb12664e3b361a084475aaa10f)
- SweepModal: copy changes, change default to 1, fix broken images [96c8258](https://github.com/reservoirprotocol/reservoir-kit/commit/96c82585f5eb55770f865e88fc71359eb4253e28)
- Expose unofficial useCoinConversion hook [12591d9](https://github.com/reservoirprotocol/reservoir-kit/commit/12591d9da934e3a092fa6b35a164725b674ef129)
- Support seaport 1.5 for oracle orders [bdc73ef](https://github.com/reservoirprotocol/reservoir-kit/commit/bdc73efabd12f0b05a2a65410834924fd73d0246)

## [v0.16.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/0ba32ae2c6c5a89ad08a983444ea06908c41fb73) (2023-05-05)

## [v0.16.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/f5b2db715c153d8316801f8bbbdb37290404fe5a) (2023-05-05)

- [BREAKING] Fix reserved keyword typescript errors with default chain type (changed to active) [f93eea0](https://github.com/reservoirprotocol/reservoir-kit/commit/f93eea0a25028c0cd1be7ab2543898232f68a9a6)

## [v0.15.7-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/69bc916d3aaa5e439741561bb6df6e40d92e2207) (2023-05-02)

- Added tooltip to all currencies [afdf0f7](https://github.com/reservoirprotocol/reservoir-kit/commit/afdf0f7295d160784a8f7c4d6a96d24a84958db6)
- Add ability to pass quantity to placeBid function in BidModalRenderer when creating a custom BidModal [c232268](https://github.com/reservoirprotocol/reservoir-kit/commit/c23226811391fe14b62ef56fa6540382297b25ef)

## [v0.15.6-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/31393e72a0e2b36caa32985bcc2b3065fb811cea) (2023-04-28)

- Fixed missing price in callback dependencies for edit listing modal [2e94a10](https://github.com/reservoirprotocol/reservoir-kit/commit/2e94a10a60c8f35e2809207ef63a7493e8912149)
- Show a warning when using deprecated APIs [c6bf13d](https://github.com/reservoirprotocol/reservoir-kit/commit/c6bf13d57fffee302af86d3ee8c1dccce73aa526)
- Fix marketplace redirects on ListModal [04f7435](https://github.com/reservoirprotocol/reservoir-kit/commit/04f743578fc59805b6def02af78a958e9970be46)

## [v0.15.5-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/88f62ea4ece5e0e51b913f4a92ca10f70fc04cd7) (2023-04-21)

- Add optimism wrapped contract address used for bidding [a9c8438](https://github.com/reservoirprotocol/reservoir-kit/commit/a9c84387087659d264767dadecc1e00c918e1ce7)

## [v0.15.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/0bac191b0e8c3d3b9564831fd7e70ea5e0e8dc1d) (2023-04-20)

- Added sweepStep to onClose callback [3605351](https://github.com/reservoirprotocol/reservoir-kit/commit/3605351c9f36d7b0f2601eb1d632f499fbd3dcc4)

## [v0.15.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/515033b3186eb3f9f52357ee687a82dd03ac1683) (2023-04-20)

- Sweeping Modal [e53e550](https://github.com/reservoirprotocol/reservoir-kit/commit/e53e5503c1615308fdee68ea080a3f0f4ff785f5)
  reservoir-kit/commit/2e0542b)

## [v0.15.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/18e8b8dc11f02cce70f9733de3bdb843cff889b5) (2023-04-19)

- Add support for coinGeckoId global setting to map symbols to coinGeckoIds [919e33b](https://github.com/reservoirprotocol/reservoir-kit/commit/919e33b50edae08b7818354a4b90d42e83fe91d8)
- Updated list modal with updated body styles [b32fd2b](https://github.com/reservoirprotocol/reservoir-kit/commit/b32fd2bdd54ce075c868be112380611c282b846c)
- Refactored text primitive's body styles [e300556](https://github.com/reservoirprotocol/reservoir-kit/commit/e3005567331728d991343918e2e605cd258daaa5)

## [v0.15.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/17d59a69ce47d71c6c652105502309fef88be4a9) (2023-04-17)

- feat: Cleanup logical op [b6e1afd](https://github.com/reservoirprotocol/reservoir-kit/commit/b6e1afdfb818842b4da528c40cc3ef9353d0e841)
- feat: Add global coinId param [d70f800](https://github.com/reservoirprotocol/reservoir-kit/commit/d70f80094f8811da5d86281f633b99875754391b)
- Updated single marketplace state for list modal [2023-04-12](https://github.com/reservoirprotocol/reservoir-kit/commit/c955691)

## [v0.15.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/3aec049d51ca8899ba52ed02af8a5f77344f4359) (2023-04-12)

- Upgrade to v3 for user collections endpoint [734ab16](https://github.com/reservoirprotocol/reservoir-kit/commit/734ab16203b1a9508e3cdeb60e783671d20ab9c0)
- Add partial messaging support for the cart [1dd82b7](https://github.com/reservoirprotocol/reservoir-kit/commit/1dd82b708d79c63120fb054e8221ef19735000e9)
- Display Steps in the cart checkout [74d5f0a](https://github.com/reservoirprotocol/reservoir-kit/commit/74d5f0af07699180c5ea636aefbcb2ec3f1f5f1b)

## [v0.14.5-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/f295f775d25c366769d0c1edd5e27e5c36397ad5) (2023-04-07)

## [v0.14.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/88aad19c72a36d36fbca1f975bf43bf8302443e7) (2023-04-07)

- Updated executeSteps [ fixed error ux](https://github.com/reservoirprotocol/reservoir-kit/commit/2023-04-06)
- Added approval collapsible [2023-04-06](https://github.com/reservoirprotocol/reservoir-kit/commit/fad39c8)
- Merge pull request #206 from reservoirprotocol/armando/grwth-2391-let-error-messages-through-from-the [a644005](https://github.com/reservoirprotocol/reservoir-kit/commit/a6440055b2ce36d7620d6c2b753d5799e1c57127)
- Added path to executeSteps state [2023-04-05](https://github.com/reservoirprotocol/reservoir-kit/commit/57271d6)
- Removed Accordion primitive [bcadb42](https://github.com/reservoirprotocol/reservoir-kit/commit/bcadb42da40462895b9023da1de6a6197762f494)

## [v0.14.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/2f4991f415637da15e7adef62d56f20ee8a0ec24) (2023-04-04)

- feat: Expose all 400 errors from backend [629fd3d](https://github.com/reservoirprotocol/reservoir-kit/commit/629fd3d38a21171226e86390e12239d88d40547b)
- fix: Use statusCode property [4cb1093](https://github.com/reservoirprotocol/reservoir-kit/commit/4cb10931ebaa05ad2fbbc7b925ab83b095dd896f)
- feat: Expose cancel listing errors [a52e72b](https://github.com/reservoirprotocol/reservoir-kit/commit/a52e72b200b02162162c9f8038d331c14bfb83fd)
- feat: Expose cart errors [df07115](https://github.com/reservoirprotocol/reservoir-kit/commit/df07115a4a90c8706ee69af1f7ea045b1e88da27)
- Added new marketplace api to dynamically calculate the marketplace fee [6dadd2f](https://github.com/reservoirprotocol/reservoir-kit/commit/6dadd2f6a0616de6e00f356888d737c4391897ee)
- Parallelize step items [2023-03-31](https://github.com/reservoirprotocol/reservoir-kit/commit/1caf531)

## [v0.14.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/36d6937b93c53b4406b44e9fd666def6ff46d8dc) (2023-04-04)

- Add fixed fee support to BuyModal [0e3b0dd](https://github.com/reservoirprotocol/reservoir-kit/commit/0e3b0ddf523ad9de2a90e9c42077db66184306b6)

## [v0.14.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/31822b795c201bd5b312008b314270fc8b170640) (2023-04-03)

## [v0.14.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/47898101f873d11ca105e006c53fb09d0dae04e3) (2023-04-03)

- Merge pull request #199 from reservoirprotocol/ted/grwth-2337-edit-offer-modal [fd95d60](https://github.com/reservoirprotocol/reservoir-kit/commit/fd95d603898d122cd66a0ea3ae03e6f9b0e75943)
- Merge pull request #201 from reservoirprotocol/pedro/grwth-2371-update-useusertokens-hook-to-v7 [5453d8f](https://github.com/reservoirprotocol/reservoir-kit/commit/5453d8f6d2b7e8dbea3ef8305abdaf8f3b2b857a)
- Merge branch 'ted/grwth-2337-edit-offer-modal' of https://github.com/reservoirprotocol/reservoir-kit into ted/grwth-2337-edit-offer-modal [d7f6522](https://github.com/reservoirprotocol/reservoir-kit/commit/d7f65229ba34672c3d50f680d8ff709165b0d913)
- bug fix: use collectionId in tokens fetch [6785b05](https://github.com/reservoirprotocol/reservoir-kit/commit/6785b05279d564037b4b274c87e43bbdb239bb1a)
- Fix BidModal/EditBidModal balance check when currency has less than 18 decimals [6a3b74c](https://github.com/reservoirprotocol/reservoir-kit/commit/6a3b74cc9dcaef04cf47557fe80df606358e4832)
- Fix BidModal and EditBidModal to properly display the wrapped balance [5eaaaca](https://github.com/reservoirprotocol/reservoir-kit/commit/5eaaaca27fa02d906ef5bdee602480e569940a48)
- Upgrade useTokens to v6 [73a1f84](https://github.com/reservoirprotocol/reservoir-kit/commit/73a1f843f6bb87e23514f6f4a854b1720cd497ab)
- Upgrade useUserTokens to use user/tokens v7 api [ea4d7c9](https://github.com/reservoirprotocol/reservoir-kit/commit/ea4d7c90df52e2f76df370ea7fb0b9162ffaca8d)
- Added support for different currency bids to edit bid modal [74c3ed6](https://github.com/reservoirprotocol/reservoir-kit/commit/74c3ed6a1c9a7b58b35634a22808857649c2b3ce)
- Added isTokenBid logic [2df88c4](https://github.com/reservoirprotocol/reservoir-kit/commit/2df88c429d64091b5b02be3a2f949a248594d8e1)
- finished edit bid modal [e745f36](https://github.com/reservoirprotocol/reservoir-kit/commit/e745f369330363b77eeff97309b562c9ce792f20)
- wip [95688fc](https://github.com/reservoirprotocol/reservoir-kit/commit/95688fc773c448080b8dceedb72a03e96c0b9bba)
- got basic edit bid modal set up [be8b609](https://github.com/reservoirprotocol/reservoir-kit/commit/be8b609ce602acbdc14376b044f11aaa445e529f)

## [v0.13.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/db5a5c041894f79e8ce7084ad36ff98c5d3646cd) (2023-03-28)

- Update mainnet oracle zone address [c37fbc9](https://github.com/reservoirprotocol/reservoir-kit/commit/c37fbc960153af2ce8d8aa8daa9510c17ffed93a)
- Fix quantity selector colors [518f8f8](https://github.com/reservoirprotocol/reservoir-kit/commit/518f8f8158f1d621e8edacb734d6c2beb97a70be)

## [v0.13.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/ab377778c7162e4bf20be18980defa1b41097b39) (2023-03-23)

- Merge pull request #194 from oplabs/main [73ab41f](https://github.com/reservoirprotocol/reservoir-kit/commit/73ab41f82c989b1ddde8d0842faa811edf26b9b6)

## [v0.13.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/6536d3ea545b6886baf3f854365309d8c9ac5f5c) (2023-03-23)

- Add logic for non native currency conversion [50134eb](https://github.com/reservoirprotocol/reservoir-kit/commit/50134ebc13b32c8256f7c8048ae0ac9c10591ea5)

## [v0.13.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/d74762ef493ef6112897be22523f2ea98b12ca87) (2023-03-22)

- Merge pull request #195 from reservoirprotocol/ted/grwth-2247-oracle-order-edit-listing-offer [8955637](https://github.com/reservoirprotocol/reservoir-kit/commit/89556378c847883a546fd2e48e6187abf758d87c)
- Allow passing oracle enabled [f9b1514](https://github.com/reservoirprotocol/reservoir-kit/commit/f9b151472e1f41f23d8ef26e2f3409f7ab44aabd)
- updated quantity logic below token name [924c5eb](https://github.com/reservoirprotocol/reservoir-kit/commit/924c5eb20d5930bee34071d47dcc9065aa9bcea7)
- Updated token primitive to show quanitty by name if there is expiration data [b911e58](https://github.com/reservoirprotocol/reservoir-kit/commit/b911e585b3a7307446f949767796397e8150877d)
- remove unused import [598b9be](https://github.com/reservoirprotocol/reservoir-kit/commit/598b9be0aabdbd54f29c29b52976e152ec818bb1)
- Add oracle support to bid modal [b279ae0](https://github.com/reservoirprotocol/reservoir-kit/commit/b279ae087e10f7809b729a96cad3edd6a2362e69)

## [v0.12.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/2d31ede350022436080e011da9d1be9b01db9015) (2023-03-21)

- Add arbitrum WETH contract [8540040](https://github.com/reservoirprotocol/reservoir-kit/commit/85400406851af43a673c715878c2efc9ce8960fd)

## [v0.12.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/5142760b1c475b8749d22e6db75e07f49a5307d7) (2023-03-21)

- Upgrade typescript to be compatible with wagmi@latest [16398e6](https://github.com/reservoirprotocol/reservoir-kit/commit/16398e650ae8099e4d6ab9fb70a5bc93eeceec9c)
- 1155 cart support [f582fd3](https://github.com/reservoirprotocol/reservoir-kit/commit/f582fd3cc94a00478617e7b7b214c43c8f2431be)
- EditListingModal for oracle orders [7b1f993](https://github.com/reservoirprotocol/reservoir-kit/commit/7b1f9937e6544aa7dc857f9e8f21f46c08c2d516)
- Fixed quantity selector input to allow empty value [efa2bc3](https://github.com/reservoirprotocol/reservoir-kit/commit/efa2bc3ebd53aaa2a2da0a5208014dc2386659cb)
- Update priceSubtitle [2244211](https://github.com/reservoirprotocol/reservoir-kit/commit/2244211a4fdf0149b75d24b97c91f31445938227)
- Added chain id to fetchOrders and fetchTokens [448f34f](https://github.com/reservoirprotocol/reservoir-kit/commit/448f34f43c79edd5b9947a0aac1d6ba1866da4d2)
- don't include token if orderId in checkout [99e3f4c](https://github.com/reservoirprotocol/reservoir-kit/commit/99e3f4c0f6a5ed7293d81e85ecf467b63736500f)
- Moved QuantitySelector to modal directory [b50c11d](https://github.com/reservoirprotocol/reservoir-kit/commit/b50c11d976de9efb05320f5e5c9e88c6bf7cf719)
- Added orderId and quantity to checkout [2780098](https://github.com/reservoirprotocol/reservoir-kit/commit/278009801f68a1f0ee0304c170db5099762ddd42)
- Removed hardcoded baseUrl [7c391a3](https://github.com/reservoirprotocol/reservoir-kit/commit/7c391a36fd68e1c8cd220f24674563893d26790e)
- Finished validate function [93376cc](https://github.com/reservoirprotocol/reservoir-kit/commit/93376ccf92c4eefdf589c6b12ee28663b7079c52)
- Swapped ConnectKit for RainbowKit [37c6c62](https://github.com/reservoirprotocol/reservoir-kit/commit/37c6c62e4690b36c82222d4e0fe52e527bcbc884)
- Upgrade to typescript v4.94 [ stiches v1.3.1-1](https://github.com/reservoirprotocol/reservoir-kit/commit/2023-03-09)
- Add Currency prop to bid modal [ba8e60d](https://github.com/reservoirprotocol/reservoir-kit/commit/ba8e60d71db7ac59f9272c9dfddc9430eab41788)

## [v0.12.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/e01e871b914083b8cd90447094c93e08f30d88c3) (2023-03-17)

- Fix dynamicPricing price not reverting when no items in cart [2e1cdbc](https://github.com/reservoirprotocol/reservoir-kit/commit/2e1cdbc098bed78f487c98ae8790c0a3a7791d8d)

## [v0.12.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/f3b1e34fd0222d421e82a69529bd4d0e54b899b7) (2023-03-15)

- Fix review comments on 1155 buymodal sweeping experience [ac01564](https://github.com/reservoirprotocol/reservoir-kit/commit/ac01564b69f9d7dce2bfd649d640a0e7303acdfa)
- Merge pull request #187 from reservoirprotocol/ted/grwth-2245-os-price-textfield-disappears-in-rk [537bf91](https://github.com/reservoirprotocol/reservoir-kit/commit/537bf9108d2ddcfe6d895cf2f1c88b153fc9c30e)

## [v0.11.5-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/629535bafe3c9d33b4875ff1a6fede86b871ea9c) (2023-03-10)

- Added check for collection and fetchingOnChainRoyalties to list modal's loading status [45c5190](https://github.com/reservoirprotocol/reservoir-kit/commit/45c51902c8a399d7a1b90a8b52cd458598620066)
- patch: Simplify operator note [69113fe](https://github.com/reservoirprotocol/reservoir-kit/commit/69113fedaab490b1a1222e0ec78e2cb124210b2c)
- fix: typescript errors [b10b85f](https://github.com/reservoirprotocol/reservoir-kit/commit/b10b85f1e5bdfbac9f34d5a933d089d469a674ad)
- patch: Determine oracle order from raw zone address [de81526](https://github.com/reservoirprotocol/reservoir-kit/commit/de81526a609316352618bcd840104ae3c4d4e68e)
- Rename StepData type to prevent issues when automatically exporting StepData [bff1a53](https://github.com/reservoirprotocol/reservoir-kit/commit/bff1a5376f1e553881d018bd1002aaae50f10e52)
- fix bug with 1155 order id being an empty string [fe9c172](https://github.com/reservoirprotocol/reservoir-kit/commit/fe9c17270bc8a4c1af136f66c8b86548b0a786f6)
- patch: Update cancels for oracle offers [2adcbc9](https://github.com/reservoirprotocol/reservoir-kit/commit/2adcbc917469f04539f7e0245be015ff0c2731cb)
- patch: Update cancels for oracle listings [e543af9](https://github.com/reservoirprotocol/reservoir-kit/commit/e543af94722ff25d183a673cf92654aacec29ad8)

## [v0.11.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/d2c5954b4e48c8d7d1104e31eea55b7e461a174d) (2023-03-08)

- fix: sort buy modal listings by price [c07e13c](https://github.com/reservoirprotocol/reservoir-kit/commit/c07e13c52ec225b058e127ca2cd341e95a754293)
- fix: purchasing 1155 by order id [f26e346](https://github.com/reservoirprotocol/reservoir-kit/commit/f26e346a14887b03fdcf52fb87f3363eafb1b5cb)
- Merge pull request #182 from reservoirprotocol/ted/grwth-2226-oracle-order-allow-passing-oracle [83768fc](https://github.com/reservoirprotocol/reservoir-kit/commit/83768fc8055089edace29bf77aec3b3fed03c703)
- Add oracle support to list modal [cd3e456](https://github.com/reservoirprotocol/reservoir-kit/commit/cd3e456e96bf8a1a61cc84e1c0b301813b6e4134)
- Fixed bug with 0 showing in cart item when missing price [2cad038](https://github.com/reservoirprotocol/reservoir-kit/commit/2cad03825c7966892ec55c56b05a99f5439f772b)
- 1155 sweeping via the buy modal [229ea54](https://github.com/reservoirprotocol/reservoir-kit/commit/229ea5469695b827dca88c9ab2fe68aeefbe50b4)
- Logic for 1155 sweeping in the buymodal [16d6592](https://github.com/reservoirprotocol/reservoir-kit/commit/16d6592c5b31342fa2b70eb2dee9d328f83317cf)
- Updated sorting of undefined [04de2d6](https://github.com/reservoirprotocol/reservoir-kit/commit/04de2d64e81387ebfaecad9b966b07d60e3918a1)
- Add support for dynamic pricing for contingent orders [1cb4eb0](https://github.com/reservoirprotocol/reservoir-kit/commit/1cb4eb029622a2af4f80fd747d86f530b91a2bca)

## [v0.11.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/ebe0cc4b5ea7d0d32050ca710cdcd1e0bdeb4459) (2023-03-03)

## [v0.11.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/f77b25b1639a0f9e1d927efe854fc9a0fd79e93a) (2023-03-02)

- Make param opt [b7b0c3a](https://github.com/reservoirprotocol/reservoir-kit/commit/b7b0c3ae59e9d0c342fe7cf41901b35e5ee4466e)

## [v0.11.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/0c9aeea6aedafce5002e8253695e7bafa2e7b9aa) (2023-03-02)

- Merge pull request #176 from reservoirprotocol/armando/grwth-2125-price-conversion-returns-0-due-to [3721829](https://github.com/reservoirprotocol/reservoir-kit/commit/37218299fdc43280aa584525212d5d95571c0ae4)
- Merge pull request #177 from reservoirprotocol/armando/grwth-2187-token-activity-hook [e9c8c8d](https://github.com/reservoirprotocol/reservoir-kit/commit/e9c8c8d31fef6fc00d8ca5980f031aef9b70d13d)
- Add return null for no tkn passed [f2096eb](https://github.com/reservoirprotocol/reservoir-kit/commit/f2096eb5f794e60dbc5643ec9c9acbfed6ffe678)
- rm uneeded comments [58a27e9](https://github.com/reservoirprotocol/reservoir-kit/commit/58a27e9081d0207828631ad2260e182e892bd7a2)
- Change var name [57f9f06](https://github.com/reservoirprotocol/reservoir-kit/commit/57f9f067df00bd21b561e5c62ef6f8f8ab88d53a)
- Formatting stuff [7c24d59](https://github.com/reservoirprotocol/reservoir-kit/commit/7c24d59f3cddced731ad2eb4730ae84110cca5af)
- Make apiKey and proxy optional [199a286](https://github.com/reservoirprotocol/reservoir-kit/commit/199a2862628fb40e24e38d39059d95849cb43b9b)
- Some formatting stuff [a83146b](https://github.com/reservoirprotocol/reservoir-kit/commit/a83146ba1a99dc1930b727a7d80504990e9fafe1)
- Create baseUrl func [2b9d66e](https://github.com/reservoirprotocol/reservoir-kit/commit/2b9d66eb48883cf120f512e655ea451b2ba716b8)

## [v0.11.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/45f82b6dd43c6bffbf8fe666d0e59cc298796445) (2023-03-02)

- Resolve conflicts [c111a94](https://github.com/reservoirprotocol/reservoir-kit/commit/c111a9492d15bfa8a570f1785fbba0219d61fedc)
- Merge pull request #174 from reservoirprotocol/armando/grwth-2154-improve-coingecko-conversion-currency [d4fc8ec](https://github.com/reservoirprotocol/reservoir-kit/commit/d4fc8ecef6e73ab2d1ae757e7b2f109c373aaa32)
- return null if falsy tkn [651d819](https://github.com/reservoirprotocol/reservoir-kit/commit/651d81966c6bb1f8c612ca70043711ab433e4259)
- Prevent click event bubbling in TokenMedia's fallback 'Refresh' button [593e9d0](https://github.com/reservoirprotocol/reservoir-kit/commit/593e9d0176ba551b2fe3e2ca0e3e5d1c2bad39d9)
- Return null on no tkn [cc427be](https://github.com/reservoirprotocol/reservoir-kit/commit/cc427be74a726a9820fa8d2aae6c3b3f39fbcc47)
- Fix some demo stuff [2f69015](https://github.com/reservoirprotocol/reservoir-kit/commit/2f690159011f11b01fed227bdf58fffdaea667cf)
- Get setup working [2c8e35d](https://github.com/reservoirprotocol/reservoir-kit/commit/2c8e35d7ff55224df04271fbf3501f08969f9ee4)
- Setup exports for hook [81a2079](https://github.com/reservoirprotocol/reservoir-kit/commit/81a20793be744a789ebdf0c4ddc8e2397572b7ec)
- Add params and url [c1edb97](https://github.com/reservoirprotocol/reservoir-kit/commit/c1edb97a92935e45a1cb8b2cdca37aa94dbcbab2)
- More base functionality [3928e24](https://github.com/reservoirprotocol/reservoir-kit/commit/3928e247c3437c0dc59c49dce971236815ce7cc2)
- Add types [7d969ee](https://github.com/reservoirprotocol/reservoir-kit/commit/7d969ee8951ad7bfdd245afec246d9df62acacc0)
- Use id [63cac6f](https://github.com/reservoirprotocol/reservoir-kit/commit/63cac6f06e8e595f51fb4713b6be9fce1eb345e2)
- Hook file [d429755](https://github.com/reservoirprotocol/reservoir-kit/commit/d429755be5378bcbec0a6a5e0891f1bf530bb424)

## [v0.10.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/b8a2171ff8f32d24479949c659e4adf21e7df3ad) (2023-02-28)

- Merge branch 'main' of github.com:reservoirprotocol/reservoir-kit [4199118](https://github.com/reservoirprotocol/reservoir-kit/commit/419911817664d97e8031baf818d3ddf4c8f7b218)
- Fix BidModal net amount not in the same currency as bid amount [3dad8df](https://github.com/reservoirprotocol/reservoir-kit/commit/3dad8dfae6e59f66b4007042a168d13438f90ace)
- Fixed hooks including undefined values in data array [ee40262](https://github.com/reservoirprotocol/reservoir-kit/commit/ee40262981bfead396e56a89c3e8a36ab57066a4)
- fix: type error [bc2e87b](https://github.com/reservoirprotocol/reservoir-kit/commit/bc2e87bf013e0224bd018d242164c85587c97da8)

## [v0.10.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/85f5c52206c15fa6a0b6edb827c6ab8ac9587219) (2023-02-23)

- Upgrade execute/sell and execute/buy to v7 [1a4388a](https://github.com/reservoirprotocol/reservoir-kit/commit/1a4388afe4bfa10dc43c450000295339714cc86d)
- Merge pull request #163 from reservoirprotocol/ted/grwth-2145-update-rk-demo-to-use-connectkit [64c9419](https://github.com/reservoirprotocol/reservoir-kit/commit/64c941949017ea8146de2dd9d65f93d21143654e)
- Upgrade to execute/bid v5 [e5c9a0b](https://github.com/reservoirprotocol/reservoir-kit/commit/e5c9a0b4bb432954868485e05e0f9a1780a3bbe5)
- Upgrade to execute/list v5 [c0aad51](https://github.com/reservoirprotocol/reservoir-kit/commit/c0aad51d089dc580accecab9be4ea8ebdc5c1260)
- Swapped RainbowKit for ConnectKit and upgraded wagmi to v0.10.11 [fbcc4dc](https://github.com/reservoirprotocol/reservoir-kit/commit/fbcc4dc538453a8545bebddf18c0dbc4c8a9f5ac)

## [v0.9.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/c67e3e777e4b3b1375965ddbabc928f34f33e7af) (2023-02-22)

- Fix polygon crash when using on chain royalties [1a08d43](https://github.com/reservoirprotocol/reservoir-kit/commit/1a08d43550394502d710f3baedc9da7943faf68b)

## [v0.9.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/1fc307ed0c1662bae0a752641050576be4f557de) (2023-02-21)

- Make enableOnChainRoyalties optional [3729c9f](https://github.com/reservoirprotocol/reservoir-kit/commit/3729c9f702771357a7e38154f31f8af2b3a35dea)

## [v0.9.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/b9901c4cb4a20e41f300f64302dbb342755efe31) (2023-02-21)

- Merge pull request #160 from reservoirprotocol/feature/royalty-improvements [b810030](https://github.com/reservoirprotocol/reservoir-kit/commit/b8100304440784d9c9716f62f282e76efaa34fff)
- fix: OS fee calculation for listing [0c218a1](https://github.com/reservoirprotocol/reservoir-kit/commit/0c218a1524d9db698fc45119f84c818b98d42f71)
- fix: bug importing wagmi chains [6082987](https://github.com/reservoirprotocol/reservoir-kit/commit/6082987ffaff66edc98cfbb3434c7412293d2b5f)
- Only add fees to seaport listings [6516f4d](https://github.com/reservoirprotocol/reservoir-kit/commit/6516f4d6015ba1aca6d35e55dcba90f3cd20d6cb)
- Merge pull request #161 from reservoirprotocol/pedro/grwth-2123-handle-when-token-thumbnail-is-missing [4cd8f10](https://github.com/reservoirprotocol/reservoir-kit/commit/4cd8f109e6cb1305e10ac991424ae4d0883311bf)
- Fix mixed cart alert happening when cart item is unavailable [86d46b1](https://github.com/reservoirprotocol/reservoir-kit/commit/86d46b1d0d374789b21e35d9552fefff88ec2f94)
- Fallback to collection image is token image is missing in the cart [03ba888](https://github.com/reservoirprotocol/reservoir-kit/commit/03ba8883e2113cc2aab94d302bfdfcb152b6048f)
- fix: remove unnecessary async [0860edc](https://github.com/reservoirprotocol/reservoir-kit/commit/0860edc77a4097a3511c60470aef3093b9255971)
- Support passing enableOnChainRoyalties to ListModal [7905657](https://github.com/reservoirprotocol/reservoir-kit/commit/7905657ea59d281bf8d0528ecd82187bfe2ceef7)
- Update OS fee amount [ea36154](https://github.com/reservoirprotocol/reservoir-kit/commit/ea361544c8a6e267c748ea84f3ee7faa28e1475d)

## [v0.9.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/642ac180f973eb96a0641b39bae2af7ff233e8d7) (2023-02-20)

- Merge pull request #157 from reservoirprotocol/pedro/grwth-2094-currency-icon-changes-when-adding-tokens [21cabf0](https://github.com/reservoirprotocol/reservoir-kit/commit/21cabf0b7eb2ac0efa31b02c8b50448d33d295e2)
- Fix typo in cartpopover toast [1c89d06](https://github.com/reservoirprotocol/reservoir-kit/commit/1c89d06b40b7887faa4e76c034ec80ff816d9efe)
- Merge pull request #158 from reservoirprotocol/pedro/grwth-2103-price-change-indicator-displays-when [f549261](https://github.com/reservoirprotocol/reservoir-kit/commit/f5492618225cb202aa3bcf24b48e80891f343a89)
- Suppress price change alerts when removing an item from the pool in your cart [be1bcfe](https://github.com/reservoirprotocol/reservoir-kit/commit/be1bcfe10952b2393268e1c612164922a2336812)
- Add currency conversion warnings, add handler for when wallet is not connected in the CartPopover [33b010b](https://github.com/reservoirprotocol/reservoir-kit/commit/33b010be97d9026003acbf5279a066b95e74cf76)
- Add logic to prevent users from adding tokens they own or that has a listing they own in the cart [87de1c5](https://github.com/reservoirprotocol/reservoir-kit/commit/87de1c58c3d2a2c7af4ab2c185b9e01ce7bb266d)

## [v0.9.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/c40bbfbbc2201168851538e5fc738191c424d1d2) (2023-02-15)

- Sync api [f08021d](https://github.com/reservoirprotocol/reservoir-kit/commit/f08021dfd25baff6626665d6a82377a149073599)
- Merge pull request #154 from reservoirprotocol/pedro/grwth-1940-hooks-configured-with-dynamic-reservoir [e93f7a5](https://github.com/reservoirprotocol/reservoir-kit/commit/e93f7a5a367797c68470eb6cf5934ac3376fbffb)

## [v0.8.14-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/9bfc952537d94c61b660a7004e8369cadd793d86) (2023-02-15)

- Merge pull request #153 from reservoirprotocol/pedro/grwth-517-change-the-colors-for-rk-dark-mode [bf02e4b](https://github.com/reservoirprotocol/reservoir-kit/commit/bf02e4b8a8a54c881d2316cb1125dd96fc66063d)
- Tweak copy, enlarge cart popover empty state [10a18a2](https://github.com/reservoirprotocol/reservoir-kit/commit/10a18a20ad0b93453a1426b859b6a0c0950d5e0e)
- Merge pull request #150 from reservoirprotocol/pedro/grwth-1904-js-error-when-listing-for-extremely [e338aac](https://github.com/reservoirprotocol/reservoir-kit/commit/e338aac695778f769a30a7b2da1b9c7ba8d5ccee)
- Price update alerts only impact items that have an active price [61b17be](https://github.com/reservoirprotocol/reservoir-kit/commit/61b17bec52fffd13526a2efecb2f8dcc38b2e7b3)
- Improved logic and ux for minimum list amount [6c67f6e](https://github.com/reservoirprotocol/reservoir-kit/commit/6c67f6ead52ad634b58cd21531c36c7339f501c0)
- [BREAKING]: chain configuration overhaul [5214394](https://github.com/reservoirprotocol/reservoir-kit/commit/52143949362b4974d95ead6f6844e9dea1b6b9d3)
- Adjust default dark theme modal colors [d11505f](https://github.com/reservoirprotocol/reservoir-kit/commit/d11505f6d34dd518789c549d7cb6adca32ed5570)

## [v0.8.13-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/ec1c8b2b7ff5ed8238701dff3c70e1b217480a8b) (2023-02-10)

- Add tokenUrl link to CartPopover [84fc21a](https://github.com/reservoirprotocol/reservoir-kit/commit/84fc21ab31048c9b64e09126b8dc3bf9774fccd4)
- Fix cartpopover sizing on mobile [e495be4](https://github.com/reservoirprotocol/reservoir-kit/commit/e495be4cc3f3c304329d52f52e155cf2ff1ea2a8)

## [v0.8.12-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/7adf0ad9d57fa4aa19957484670e7b3b51545ad8) (2023-02-09)

- includeDynamicPricing by default in useDynamicPricing hook [de9d3df](https://github.com/reservoirprotocol/reservoir-kit/commit/de9d3dfb52e37d863049941f8ce37573ce599aba)

## [v0.8.11-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/263b9403701b3bff8548ce3ffaa24fa2ad5ce746) (2023-02-09)

- Remove trigger style from CartPopover [219ec20](https://github.com/reservoirprotocol/reservoir-kit/commit/219ec20cf7dcdfd61d1cb1363476aeb757e7678a)

## [v0.8.10-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/78229c1af7fe5205033f0887c899a68e899fb789) (2023-02-09)

- Merge pull request #149 from reservoirprotocol/ted/grwth-2003-token-price-doesnt-refresh-after-listing [d10cc35](https://github.com/reservoirprotocol/reservoir-kit/commit/d10cc357dc8de839e2ebf8c8abc6d5f974cec029)
- Added currentStep to onClose callback data [5a693c4](https://github.com/reservoirprotocol/reservoir-kit/commit/5a693c4d154e6017c49ffb1025d26c180b680153)
- Merge pull request #148 from reservoirprotocol/ted/grwth-1972-prevent-click-event-bubbling-in [40b7f33](https://github.com/reservoirprotocol/reservoir-kit/commit/40b7f3323f807b2b6d2952b4609f75dc4f60ac29)
- Merge pull request #145 from reservoirprotocol/ted/grwth-1955-update-listing-expiration-date-to-6 [9ad427e](https://github.com/reservoirprotocol/reservoir-kit/commit/9ad427e5c5b42ee97f09189cb496a8b47189a9e3)
- Prevent entering in a list price for extremely low, which errors out [80970e7](https://github.com/reservoirprotocol/reservoir-kit/commit/80970e73aaf5544e97e168d3f69beb9e69af040a)
- Moved onClose logic to be inside onOpenChange function [27e4d6e](https://github.com/reservoirprotocol/reservoir-kit/commit/27e4d6ee8affe41185e143c6dad21ec624840ee7)
- Dynamic pricing in cart [44a7193](https://github.com/reservoirprotocol/reservoir-kit/commit/44a7193bc8f383922dc1e86cd6474a7804fed33e)
- Fixed modals not triggering onClose when clicked outside [eb08bbc](https://github.com/reservoirprotocol/reservoir-kit/commit/eb08bbce10fb983984d66ec3511c497713d659c8)
- Add dynamic pricing, refactor to have a simpler interface [5418e70](https://github.com/reservoirprotocol/reservoir-kit/commit/5418e705af0494322c1f5e70dae1f5ce281d46bc)
- Prevent click event bubbling in TokenMedia component [d73e872](https://github.com/reservoirprotocol/reservoir-kit/commit/d73e8729c3e0093c229bab807f998bf451a01a94)
- Referrer fee ui for cart popover [316d887](https://github.com/reservoirprotocol/reservoir-kit/commit/316d88728e8f964c4e2a166bc883b0d82101073e)
- Fix error on bid modal when fetching mainnet and goerli chains [32467ed](https://github.com/reservoirprotocol/reservoir-kit/commit/32467edb7e0bdb692a27c6bcec4fa18d2f7f6f95)
- cart persistence, transaction handling [7befeb6](https://github.com/reservoirprotocol/reservoir-kit/commit/7befeb65cea2c6d1e7d3236f374181d0fca2d1c7)

## [v0.8.9-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/9b58dd32926e725ae1d61b1bf2a00c5c30a04cd0) (2023-01-30)

- Fix safari rounding issues when using Intl.NumberFormat [1aa9e85](https://github.com/reservoirprotocol/reservoir-kit/commit/1aa9e8577a091f883e0e640de18769e73bc2e3c8)
- Fix: deduct royalties from profit in list modal [aede012](https://github.com/reservoirprotocol/reservoir-kit/commit/aede01228149ef14ce4db85a3df09172becec8de)
- Updated list modal's button copy [36843d3](https://github.com/reservoirprotocol/reservoir-kit/commit/36843d3579b307336311e9af73fc47f82b18a3cf)
- fixed Big Number conversion for weiPrice in List Modal [062b4a9](https://github.com/reservoirprotocol/reservoir-kit/commit/062b4a9f352c69653aa2b3a76a2e494572680d3a)
- Updated listing expiration date of 'None' to '6 Months' [a417b3d](https://github.com/reservoirprotocol/reservoir-kit/commit/a417b3dc1b390000be260088c9cfddc085916098)
- 🎉 Release ui package v0.8.9 [f3b46d5](https://github.com/reservoirprotocol/reservoir-kit/commit/f3b46d50e620dbb34561e367ef2276c9f63a4045)
- Merge pull request #141 from reservoirprotocol/pedro/grwth-1831-fix-safari-rounding-issue-in-v16 [1667052](https://github.com/reservoirprotocol/reservoir-kit/commit/16670524cb72e54be1f9d61d0803f03ef27bce49)
- Merge pull request #142 from reservoirprotocol/ted/grwth-1912-listmodal-profit-doesnt-deduct-royalties [30d827e](https://github.com/reservoirprotocol/reservoir-kit/commit/30d827e2350ca13e476031c6d86734d43fd9ba68)
- Merge pull request #143 from reservoirprotocol/ted/grwth-1893-listing-modal-copy-suggestion [453e9f2](https://github.com/reservoirprotocol/reservoir-kit/commit/453e9f21eebe7ad6caa75970076041a68eb565d5)
- wip cart popover [18715e2](https://github.com/reservoirprotocol/reservoir-kit/commit/18715e26477196a69f8f3c79a33393ed3616c55e)
- Support fetching multiple ban statuses from opensea [aacf0f7](https://github.com/reservoirprotocol/reservoir-kit/commit/aacf0f700d6d4fb918bf34d1c79a7348ab793275)
- fixed Big Number conversion for weiPrice in List Modal [947547d](https://github.com/reservoirprotocol/reservoir-kit/commit/947547df01102eb33521edf9dbab76f5ce9e7718)
- Updated list modal's button copy [813f863](https://github.com/reservoirprotocol/reservoir-kit/commit/813f863e773d1938bab0a05508a60b0fae975ba0)
- Fix: deduct royalties from profit in list modal [7f42c59](https://github.com/reservoirprotocol/reservoir-kit/commit/7f42c5957f252378924fd1e7bf7f2a7da6d3eb71)

## [v0.8.8-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/7c02a38d9a93b8eeffc06c041bf9ec77c7a8bd0b) (2023-01-23)

- Fix safari rounding issues when using Intl.NumberFormat [2afb52a](https://github.com/reservoirprotocol/reservoir-kit/commit/2afb52a8cf2a524543fda849492f464f597ddf7e)
- Merge pull request #140 from reservoirprotocol/pedro/grwth-1914-not-getting-updated-balance-for-custom [1667272](https://github.com/reservoirprotocol/reservoir-kit/commit/166727269aa05ca3af18b9057e8b009598270a9a)
- Merge pull request #139 from reservoirprotocol/pedro/grwth-1849-upgrade-swr-to-v2 [a38820d](https://github.com/reservoirprotocol/reservoir-kit/commit/a38820d32025c0c1f17af3c6ae792b5251d42794)
- Remove chain_id configuration from useBalance check [3818d73](https://github.com/reservoirprotocol/reservoir-kit/commit/3818d7337febcedd476af09be1b76d23c74cd4c7)
- Fix hasNextPage when using an offset [7358721](https://github.com/reservoirprotocol/reservoir-kit/commit/73587210b0872c043dbdad8c7590c5db931b6959)
- fix swr migration issue when passing string vs array to fetcher [14fc230](https://github.com/reservoirprotocol/reservoir-kit/commit/14fc2302e204fc8058a31924c700a983445e142b)
- Fix useCollections hook not passing api key or version [1829507](https://github.com/reservoirprotocol/reservoir-kit/commit/18295079e3d5c12001f4b284db8d5fc3d7795c94)
- Normalize hook responses and add resetCache function to hook response [d4a99ea](https://github.com/reservoirprotocol/reservoir-kit/commit/d4a99eac8c7149f079e30cc8eaa6177ababbc187)

## [v0.8.7-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/6daa7a0babde75c34f53b26c9f52988194a118ea) (2023-01-20)

- Merge pull request #132 from reservoirprotocol/pedro/grwth-1668-improvement-for-listing-1155-in-quantity [e3c135d](https://github.com/reservoirprotocol/reservoir-kit/commit/e3c135d6cd15f69e346435d5ceb591a115276c7e)
- fix: prevent 0 pricing when listing [ba92d2f](https://github.com/reservoirprotocol/reservoir-kit/commit/ba92d2fbe258a8a846908a2226a796f9906f6e1e)
- Merge pull request #133 from reservoirprotocol/pedro/grwth-1679-update-single-token-purchase-price [1faf587](https://github.com/reservoirprotocol/reservoir-kit/commit/1faf58741fc9853149a5e33cd12617c96436d9d8)
- Merge pull request #136 from reservoirprotocol/pedro/grwth-1678-acceptbid-modal-price-change-update [0c71239](https://github.com/reservoirprotocol/reservoir-kit/commit/0c712394a59bd2e4113bd1143eae41ef9210b11b)
- Merge pull request #135 from reservoirprotocol/pedro/grwth-1743-bidmodal-displays-collection-floor-ask [cfbd8a3](https://github.com/reservoirprotocol/reservoir-kit/commit/cfbd8a39fa786172f64338a3caa47a6e085e0d8a)
- Merge pull request #137 from reservoirprotocol/pedro/grwth-1519-client-passes-currency-when-filling [b624149](https://github.com/reservoirprotocol/reservoir-kit/commit/b6241494b00ebf0c0eda662929e9d6f93955c376)
- Update AcceptBidModal title [dcf3050](https://github.com/reservoirprotocol/reservoir-kit/commit/dcf30500b7c3580ad0e9f0dae8aee5d7171b277b)
- Remove currency from params when buying a listing, handled automatically on the backend [17804be](https://github.com/reservoirprotocol/reservoir-kit/commit/17804be10337eb604b124e678cb71e6d11d42502)
- BuyModal: ignore listings that are not active [f5bbb78](https://github.com/reservoirprotocol/reservoir-kit/commit/f5bbb7859c27d9ecf5c5e615e25e6a3d1bec963d)
- ListModal remove sync logic and toggle, remove prepopulated price, improve ux when price is 0 [410ba82](https://github.com/reservoirprotocol/reservoir-kit/commit/410ba8230dd7f03ee93d536712a1dd51096349c2)

## [v0.8.6-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/9ddaf5de3534753a4b1f97b6c77d549bec14d0af) (2023-01-12)

- Improve accept bid modal loading ux and improve price mismatch ux [93f5a84](https://github.com/reservoirprotocol/reservoir-kit/commit/93f5a84458541c318707f7842e713f3c5fc0b8cb)
- Fix floor ask price for trait selector in the BidModal [8fe3c64](https://github.com/reservoirprotocol/reservoir-kit/commit/8fe3c64eb83b6d0334bb8c99c101b30b4c9d86c7)
- Updated token media prop types [65a54e0](https://github.com/reservoirprotocol/reservoir-kit/commit/65a54e0c2748bcb1db271be2282198a168d04455)
- Improve loading ux and refresh data if an error occurs whenn trying to buy [7cd3749](https://github.com/reservoirprotocol/reservoir-kit/commit/7cd3749e5ab155b443232edb5bfdab0385322fb2)
- Improve 1155 listing ux, unblock opensea 1155 quantity listing [0d22cac](https://github.com/reservoirprotocol/reservoir-kit/commit/0d22cac16467e4f91692aea4380fc1e7e4092ae1)
- Merge pull request #129 from reservoirprotocol/pedro/grwth-1294-useownerlistings-hook-firing-when-not [7170a45](https://github.com/reservoirprotocol/reservoir-kit/commit/7170a45c94a4d68c6435a89ba25b5133d92bd70a)
- Add padding to TokenMedia and aspect ratio [07efc9c](https://github.com/reservoirprotocol/reservoir-kit/commit/07efc9cf1fed40adfb0827c01403814cc82a370a)
- Prevent useOwnerListings hook from firing if user is not connected [6b2e7f3](https://github.com/reservoirprotocol/reservoir-kit/commit/6b2e7f34e3e9282f83c405b43531186aeab5a55d)

## [v0.8.5-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/8bbe6e912eb7f4e08cf40518dff264e44ecd606d) (2023-01-09)

- Merge pull request #128 from reservoirprotocol/feature/use-user-collections-hook [273d7fa](https://github.com/reservoirprotocol/reservoir-kit/commit/273d7fafdf7ee9c4536ae70f1602880f94ffb584)
- Updated limit variable name and logic [a81dcc6](https://github.com/reservoirprotocol/reservoir-kit/commit/a81dcc6d9a96934bc934a0404654c108afb665cd)
- Added dynamic pageLimit variable and updated default limit [f68bdb4](https://github.com/reservoirprotocol/reservoir-kit/commit/f68bdb457d77c41818153642682fb0f37171c6d1)
- Updated default limit and offset size for useUserCollections [56af4de](https://github.com/reservoirprotocol/reservoir-kit/commit/56af4de0c96603539f8e5c4aa0ffb31b02bc8bbb)
- Add useUserCollections hook [d9af588](https://github.com/reservoirprotocol/reservoir-kit/commit/d9af5888ff109c166edb7a4f35ec2863a8767073)

## [v0.8.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/3773ef2af129451a86c98cc15131158539b1b6c0) (2023-01-06)

- Merge pull request #126 from reservoirprotocol/pedro/res-1606-update-copy-on-rk-for-polygon [2683361](https://github.com/reservoirprotocol/reservoir-kit/commit/26833612b002d2b2122223e4e0b2ec494f198ebc)
- Upgrade useCollections hook to a paginated hook [7768490](https://github.com/reservoirprotocol/reservoir-kit/commit/776849090548752561cbd9327c7bf56bd681ab77)
- Make etherscan text dynamic based on current chain [67a8824](https://github.com/reservoirprotocol/reservoir-kit/commit/67a8824d5af82e1ffb853cd03e63598855b25fc2)

## [v0.8.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/4d3c1fcce11f34d3efb24633414da8a46b2d324d) (2023-01-04)

- Update hasNextPage logic for activity hooks [61e75c1](https://github.com/reservoirprotocol/reservoir-kit/commit/61e75c116a25bae726ea1e8f8b641655fe2993ae)

## [v0.8.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/4592b2d3fc7c0cf2354b14d1eba812b002e9c7a0) (2023-01-03)

## [v0.8.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/c73cfe8acfa3a4e684bf1ddf757f587d43c2d59f) (2023-01-03)

## [v0.8.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/94aa4da3d6baf90aff853bf23fafcc88a154af8d) (2023-01-03)

- Fix type errors when migrating to asks hook and bids hook [f57b5d3](https://github.com/reservoirprotocol/reservoir-kit/commit/f57b5d32ac40945fa37682ee255e49f6dccc5680)
- Merge pull request #123 from reservoirprotocol/pedro/res-1595-update-rk-hooks-to-use-latest-apis [f65aa84](https://github.com/reservoirprotocol/reservoir-kit/commit/f65aa84145191a5942a97cefd11c055b9ce2045a)
- Updated deprecated apis used in hooks/modals [14dd5c3](https://github.com/reservoirprotocol/reservoir-kit/commit/14dd5c39394063d767be11666e31f367e9c38ce8)
- Add cancel listing modal [c815fe5](https://github.com/reservoirprotocol/reservoir-kit/commit/c815fe5da7ffca83126174389f9d08e499f7aee2)
- Fix list modal button close color [c0233b4](https://github.com/reservoirprotocol/reservoir-kit/commit/c0233b4c5a2a6ed63f093ce793e0ef6bedfe9574)
- Completes RES-1512 [20f54d4](https://github.com/reservoirprotocol/reservoir-kit/commit/20f54d4cf0c4263cb62683105495172ee5d9516a)
- CancelBid modal [ff7b989](https://github.com/reservoirprotocol/reservoir-kit/commit/ff7b9897a731f5ddfad2e8866e8efbfbbbb854d3)

## [v0.7.5-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/ba97b3c4b2540b9353228f1011c001279b595308) (2022-12-28)

- Rename reservoir-kit-client to reservoir-sdk [5591309](https://github.com/reservoirprotocol/reservoir-kit/commit/5591309a87948588f0d379133be0a5669855f2f3)

## [v0.7.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/c19e0aca0221265e93ef37a272b027c10c8e3682) (2022-12-28)

- Always pass chain id with useBalance hook [78648f7](https://github.com/reservoirprotocol/reservoir-kit/commit/78648f741b9ed40d20756f0815ce91a5cea6ffcf)
- Resolve conflicts [fd07f9c](https://github.com/reservoirprotocol/reservoir-kit/commit/fd07f9ccd5b12acc5ac8f8960a4ef489284ee4b3)
- Support different chains and tokens when checking balance [8c313a1](https://github.com/reservoirprotocol/reservoir-kit/commit/8c313a1f389185c1009e737a3e0f2998d5b5434c)
- Add lowest value to formatCurrency, fix wrapped contract price display when accepting a bid [5c8a6e2](https://github.com/reservoirprotocol/reservoir-kit/commit/5c8a6e26fe452fea436180ea32354eebc81317fe)
- Fix USD price to use wrapped contract symbol for BidModal [b67fff2](https://github.com/reservoirprotocol/reservoir-kit/commit/b67fff2c281a665a7503f1a785d26006824f595c)

## [v0.7.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/8784098b7ed7e841a707d3fe25be7c5ebc8dd7f3) (2022-12-21)

- Merge pull request #113 from reservoirprotocol/pedro/res-1642-add-oncurrentstepupdate-hook-to [6fe4a9a](https://github.com/reservoirprotocol/reservoir-kit/commit/6fe4a9a20cd86ff8fdd48fc09adcd86bfdd23fbe)
- Allow for configuring button text color [76c322f](https://github.com/reservoirprotocol/reservoir-kit/commit/76c322f3766887f413efe4f1bc482736351dbecb)
- Accept bid onCurrentStepUpdate [847d29d](https://github.com/reservoirprotocol/reservoir-kit/commit/847d29d032770aa50c299147865d3957949d6f84)

## [v0.7.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/09f88cfc9102ff0aee5eb5bab858aa1db3ce7604) (2022-12-19)

- Better support for contract ranges when accepting a bid [f7ee8b8](https://github.com/reservoirprotocol/reservoir-kit/commit/f7ee8b88dcf45d12468cd455ddeae276b02641c9)
- Cancel offer modal [f13ade4](https://github.com/reservoirprotocol/reservoir-kit/commit/f13ade456d6d317314c6cc299008ce77ab512ba7)
- fix: wrong git repo link [d7c77bf](https://github.com/reservoirprotocol/reservoir-kit/commit/d7c77bfc9ba2e62f2830dd0d04c3d1e8d31a057a)

## [v0.7.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/d6c1d19339f915d7d19f45163793503cb7b49ecf) (2022-12-14)

- Add file extensions to js imports [97b4c8a](https://github.com/reservoirprotocol/reservoir-kit/commit/97b4c8a99225d8b1e1b0469f665ec40e022d8161)

## [v0.7.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/02c7ff0b6c0878d5df78a0a5eb9aba3ffe55bba2) (2022-12-13)

- Upgrade wagmi to 0.9, fix issues when migrating to esmodules and dropping commonjs modules [30ea0f5](https://github.com/reservoirprotocol/reservoir-kit/commit/30ea0f5123b4e762bbdbdbc3288c14793108019e)

## [v0.6.6-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/dcc88bd541428d70e0421b0cee52c5b7936f79f5) (2022-12-12)

- switch to iframe for rendering svgs [765f86d](https://github.com/reservoirprotocol/reservoir-kit/commit/765f86dba10dfc8bab780961e826275e9809dac2)

## [v0.6.5-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/95ac21ebb98b687a55cbca69968e3a79955db0b8) (2022-12-06)

## [v0.6.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/01fc0c106191ead35113a16766094f63ccad850d) (2022-12-06)

- Upgrade to user tokens v6 endpoint [8ce46bc](https://github.com/reservoirprotocol/reservoir-kit/commit/8ce46bc1e91229cd68d2e15ddb218fa62450291b)

## [v0.6.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/02d316d732ec5dbd476727c31e3fd0e9ef19a3f5) (2022-12-05)

- Fix usd to coin conversion falls back to 1000 instead of 0 on ListModal [addf7ca](https://github.com/reservoirprotocol/reservoir-kit/commit/addf7ca8858bcb4419b9ffcddd8357e73f542240)

## [v0.6.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/d061183789efc89fd4f9aded1226d69442f99378) (2022-12-02)

- Add fallback style and className to fallback component [bda79f1](https://github.com/reservoirprotocol/reservoir-kit/commit/bda79f104ea81329db1557f755f35cd7c570041c)

## [v0.6.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/4668c20924226a7f4f605f554162d6b0b3d39be5) (2022-11-29)

- Merge pull request #98 from reservoirprotocol/pedro/res-673-support-buying-multiple-1155-tokens [14fd210](https://github.com/reservoirprotocol/reservoir-kit/commit/14fd210b2f85629b7e68e600cd74eeaab57d80df)
- Fix balance check when total price changes not updating hasEnoughEth variable [eebf2a6](https://github.com/reservoirprotocol/reservoir-kit/commit/eebf2a6a751d3674eec4faf18f1ba329dd8ecee2)
- Merge branch 'pedro/res-673-support-buying-multiple-1155-tokens' of github.com:reservoirprotocol/reservoir-kit into pedro/res-673-support-buying-multiple-1155-tokens [45b70dd](https://github.com/reservoirprotocol/reservoir-kit/commit/45b70ddce451eb79bb57cc901bbdaf0aba84336f)

## [v0.6.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/dabcaa32cf61017bc514b4952db26b94ac22dfd5) (2022-11-28)

- Merge pull request #106 from reservoirprotocol/pedro/res-1166-convert-bps-fee-to-wei-price-when-buying [ab1c907](https://github.com/reservoirprotocol/reservoir-kit/commit/ab1c9071f6be9382cf0d26777fe265f9a45db9c6)
- Merge branch 'pedro/res-955-rk-broken-currency-logo-on-polygon' of github.com:reservoirprotocol/reservoir-kit into pedro/res-955-rk-broken-currency-logo-on-polygon [9cef78f](https://github.com/reservoirprotocol/reservoir-kit/commit/9cef78fedd64d8425d283077de0ce79bb73b92b7)
- Resolve conflicts [fb66b4e](https://github.com/reservoirprotocol/reservoir-kit/commit/fb66b4e3289262799f340075500d7cb1eccc14fb)

## [v0.5.12-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/3912d593ea7230b68ae6be7d46b2c5e2299b933a) (2022-11-28)

- Improve audio and video rendering, adding a default fallback [d42326b](https://github.com/reservoirprotocol/reservoir-kit/commit/d42326b9b2419dc6a7e89e32c6dcf2a7a6cc2f5b)
- Loosen type restrictions for TokenMedia [dfa45e6](https://github.com/reservoirprotocol/reservoir-kit/commit/dfa45e6477f489996a676fbd947019cb85182df7)
- swapped illustrations for generic icons [a5cc2e5](https://github.com/reservoirprotocol/reservoir-kit/commit/a5cc2e51ff4dd8943305dd1d35dc8a10c2530905)
- Disable quantity selector on Listmodal if a non native marketplace is selected [9f0348e](https://github.com/reservoirprotocol/reservoir-kit/commit/9f0348efe7f041766d4ab90f2f5cbc661b62dde5)
- Remove referrerFee from global configuration due to difficulty calculating bps to atomic unit [b97ec47](https://github.com/reservoirprotocol/reservoir-kit/commit/b97ec473860c3640d1c5999bc66d3ff4a94ae260)
- Default dimensions and positioning for TokenMedia [e51e548](https://github.com/reservoirprotocol/reservoir-kit/commit/e51e548fff24e44a95cea1e90e3962a448356572)
- Add normalize royalties to useListings hook in BuyModal [d334541](https://github.com/reservoirprotocol/reservoir-kit/commit/d334541102171392820d59494c61b8327a8c4b20)
- Calculate referral fee in lowest common denominator in BuyModal [36ec148](https://github.com/reservoirprotocol/reservoir-kit/commit/36ec1488c419dfe0c63a4cd50f495ff705442a44)
- Fix quantity not recalculating ListToken method in ListModalRenderer [3406c6f](https://github.com/reservoirprotocol/reservoir-kit/commit/3406c6f4b3625c4a44b286f7ee714717c2ae0f34)
- Token media renderer [800aef7](https://github.com/reservoirprotocol/reservoir-kit/commit/800aef7de62b4cba2b73a5062b597cc07486325d)

## [v0.5.11-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/8ca45dc44f4662ab12cd836c04e04f860e921a56) (2022-11-18)

- Support normalize royalties in useUserTopBids hook [b30fff7](https://github.com/reservoirprotocol/reservoir-kit/commit/b30fff739b5711ed9472a86a6dc0f5a4d0aa2766)
- Fix attributes recalculating on every render [5ff1f0a](https://github.com/reservoirprotocol/reservoir-kit/commit/5ff1f0a7149047de5bd508bd03d747d3203e2be6)
- Multiply quantity by price when buying multiple erc1155 tokens in BuyModal [c2bc9f7](https://github.com/reservoirprotocol/reservoir-kit/commit/c2bc9f7ce0e36fab50ef4989b47bcfca01a65b8f)
- 🎉 Release ui package v0.5.11 [995208c](https://github.com/reservoirprotocol/reservoir-kit/commit/995208c2a05b5465920cfb697fbed38e95c033a1)
- Merge pull request #103 from reservoirprotocol/pedro/res-1159-add-normalizedroyalties-to [ff2d479](https://github.com/reservoirprotocol/reservoir-kit/commit/ff2d4794cefe087d71dd97d88823c0d5d52976e3)
- Support normalize royalties in useUserTopBids hook [167404f](https://github.com/reservoirprotocol/reservoir-kit/commit/167404f4cf41a9fd632d5a4a1828ef3980064c14)
- Fix attributes recalculating on every render [aadb2f8](https://github.com/reservoirprotocol/reservoir-kit/commit/aadb2f80ec3ad6ed9b79e1f7f1dfe30240400ea4)
- added support for buying by order id in the BuyModal [6e8bdb3](https://github.com/reservoirprotocol/reservoir-kit/commit/6e8bdb3ac759da953236fc320b65cc17291cc7d9)
- Merge branch 'main' of https://github.com/reservoirprotocol/reservoir-kit into ted/res-1139-rk-upgrade-wagmi-to-v07x [4242e80](https://github.com/reservoirprotocol/reservoir-kit/commit/4242e80714a78c8274854894843b720cba0268b3)
- switched wagmi to v0.7 [fd281e4](https://github.com/reservoirprotocol/reservoir-kit/commit/fd281e4c37fb7e24571f89da257e2521137bebc9)
- Fix issues with loading listing in buy modal [ef59ae5](https://github.com/reservoirprotocol/reservoir-kit/commit/ef59ae5c5b94be3ee9fb129c93ea3fbe64963927)

## [v0.5.10-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/c516cd0bcc4e7934d674003101e52727e5971c83) (2022-11-16)

- Get normalizeRoyalties flag from client instead of RK ui provider [c031956](https://github.com/reservoirprotocol/reservoir-kit/commit/c03195644a33f200b972320f98905327eade45ea)
- Merge branch 'main' of https://github.com/reservoirprotocol/reservoir-kit into ted/res-1139-rk-upgrade-wagmi-to-v07x [eb879cc](https://github.com/reservoirprotocol/reservoir-kit/commit/eb879cc712acbeb8a78b4dfaf7a494739ce32c57)
- 🎉 Release ui package v0.5.10 [9fefc15](https://github.com/reservoirprotocol/reservoir-kit/commit/9fefc15eb04dccb0e67e085fdb59ca2a27f47b2a)
- upgraded wagmi to 0.7.4 and fixed breaking changes [3710d63](https://github.com/reservoirprotocol/reservoir-kit/commit/3710d633d30f17b72afbd8445c07eba60ffb22ba)
- Support overriding normalize royalties in reservoir-kit client [b937df8](https://github.com/reservoirprotocol/reservoir-kit/commit/b937df80ba7d5c7d5108acfccca112e6a65afc86)

## [v0.5.9-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/0438c30679229ca48191dad1dd8ac95ba5df6266) (2022-11-15)

- Merge pull request #90 from reservoirprotocol/pedro/res-967-buymodal-expected-price [848c104](https://github.com/reservoirprotocol/reservoir-kit/commit/848c10440d782667295a7d9fa990f549e8d78e6b)
- Merge pull request #91 from reservoirprotocol/feature/normalized-royalties [96c853e](https://github.com/reservoirprotocol/reservoir-kit/commit/96c853ed088efa14ea6874351b0cfefd04e51309)
- Resolve conflicts [8d2ab48](https://github.com/reservoirprotocol/reservoir-kit/commit/8d2ab48dab8de568eca76960469d184327f2ecf1)
- Merge pull request #93 from reservoirprotocol/pedro/res-1060-slow-loading-ux-bid-modal-deeplinking [af10bd4](https://github.com/reservoirprotocol/reservoir-kit/commit/af10bd424ba0e4528c85cd165175a91c572754f2)
- Merge pull request #94 from reservoirprotocol/pedro/res-709-bidmodal-attribute-filter-doesnt-support [86c0945](https://github.com/reservoirprotocol/reservoir-kit/commit/86c094534102d2acf09e68fbfc2878b2b8375a19)
- Support erc1155 quantity selection in BuyModal [24101fa](https://github.com/reservoirprotocol/reservoir-kit/commit/24101faea2296688741955f25476e1e3d49e1ea8)
- update default and follow-thru on close [21a3d93](https://github.com/reservoirprotocol/reservoir-kit/commit/21a3d939c088f4c16ad2bd1b1ac5b58dda7cf1ee)
- Support erc1155 quantity selection in ListModal [c51bffd](https://github.com/reservoirprotocol/reservoir-kit/commit/c51bffd36867178ef2f874e306608a33b010ada7)
- bid expiry to 1mo to match listing [04f8cd7](https://github.com/reservoirprotocol/reservoir-kit/commit/04f8cd789eb11745f636b00da656257ceee8ad45)

## [v0.5.8-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/21c03f34f8f4d54a1dfb2bd4d409b53cdffaa324) (2022-11-11)

- Set default ListModal expiration to 1 month [d906c98](https://github.com/reservoirprotocol/reservoir-kit/commit/d906c98fc28e34287ccbf80fe9752d20b5630df2)
- Filter out range attributes from BidModal attribute selector [c102466](https://github.com/reservoirprotocol/reservoir-kit/commit/c102466d2a746c5bd81492c9735749604aac124d)
- Fix unnecessary call to fetch attributes when bidding on a token using the BidModal [4d255cf](https://github.com/reservoirprotocol/reservoir-kit/commit/4d255cf12d2c8fc694af46adaaf7e6f681a5fec9)
- Improve ux when loading a bid to accept in the AcceptBidModal [71c22a2](https://github.com/reservoirprotocol/reservoir-kit/commit/71c22a253b72f48a5c17b5d9e30017ae492709ff)
- Fix issues with wrapped contract balaance lookup in bids [d14cb9e](https://github.com/reservoirprotocol/reservoir-kit/commit/d14cb9ebdad82aab32eb8ef2da3edf51bd3b78c0)
- Fixes RES-1028: add ability to override global normalize royalties configuration per relevant modal [c69ce46](https://github.com/reservoirprotocol/reservoir-kit/commit/c69ce46a31199a165882c024484fe79174e03a96)
- Fixes RES-1030: Add support for global normalized royalties configuration [adb9d62](https://github.com/reservoirprotocol/reservoir-kit/commit/adb9d62ba83af5926d72302c9bb8b14fbc5dd3af)
- Add support for polygon and refactor for generic native/wrapped currencies based on chain [822498d](https://github.com/reservoirprotocol/reservoir-kit/commit/822498df643e6df7406989d738ffe23355353c8f)
- Improve error message for price mismatch in buy modal [4d10a02](https://github.com/reservoirprotocol/reservoir-kit/commit/4d10a02c3a4a7ff17e6f54a1746434833a358263)

## [v0.5.7-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/31e969397c1ebdee1c888c464ad8312ef831972c) (2022-11-04)

- Add support for accepting a bid by id in the AcceptBidModal [64016b3](https://github.com/reservoirprotocol/reservoir-kit/commit/64016b3dfa2c65fc43328b545facd9331d5e4a61)
- Add ability to enable/disable useBids hook [8e3d6d9](https://github.com/reservoirprotocol/reservoir-kit/commit/8e3d6d97007bb447f0e650a8b9d46867fbcfd84a)

## [v0.5.6-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/3c8cc3b3a8678a2d496c82d6900713b9687a6291) (2022-10-26)

## [v0.5.5-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/a83c6b2009ee22818c4c62f8af95e054fc8a8f47) (2022-10-26)

## [v0.5.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/1379ceac17b3026cd6591780e5ad9b27fbfb20f0) (2022-10-25)

- Merge pull request #84 from reservoirprotocol/fix/list-modal-text-overflow [5ea641d](https://github.com/reservoirprotocol/reservoir-kit/commit/5ea641d6955691b0347ec2c45aaf0a26404e7188)
- Fix issue with attribute prop after opening [94515f0](https://github.com/reservoirprotocol/reservoir-kit/commit/94515f08553d4c60aebc43dd01d22410bf954c37)
- Add ListModal toggle for nativeOnly to remove all non native marketplaces [cef9531](https://github.com/reservoirprotocol/reservoir-kit/commit/cef9531924f9d43870818c8cabe26d5bbe161670)

## [v0.5.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/712425aaf48570da98c7df2d0a39a85f6fd6f524) (2022-10-24)

- Switch to standard US date format when displaying dates [a4f5fa1](https://github.com/reservoirprotocol/reservoir-kit/commit/a4f5fa1e5cbeccf0e857ca1c47c2bfb270d6b784)
- Add openState property to programmatically open the BuyModal, ListModal, BidModal and AcceptBidModal [8d046a6](https://github.com/reservoirprotocol/reservoir-kit/commit/8d046a6b45504daa7d754fbe6e9c606a90800354)

## [v0.5.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/387d2fa6b811df554518a5d87f9c3cef67f29d81) (2022-10-21)

## [v0.5.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/44bbcbccca2321549a918590e3f09db68446cfbf) (2022-10-20)

- Fix issue with useUserActivity types [167b246](https://github.com/reservoirprotocol/reservoir-kit/commit/167b2468625e212b75a25b2b1cf605993eb8a1ba)

## [v0.5.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/d6ed02c3356e447cd44e452a54da97cf4333f174) (2022-10-20)

- Upgrade useCollectionActivity to v4 [be913c1](https://github.com/reservoirprotocol/reservoir-kit/commit/be913c15b52631a99c684430846e0a1cf4785789)
- added truncation support to all labels on the list and bid modals [6aa5da0](https://github.com/reservoirprotocol/reservoir-kit/commit/6aa5da09cb4a61be16f7c8f6dd93a9338450ce9b)
- Fix typescript error in useUserActivity [9e63f50](https://github.com/reservoirprotocol/reservoir-kit/commit/9e63f50685ff553f4eb1c2ff834a69f348300510)

## [v0.4.14-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/c2ddf9d22a0ba705fca835de6948cbcfbf8a1b67) (2022-10-20)

- Display blank for List Price when no listing is available [9142c21](https://github.com/reservoirprotocol/reservoir-kit/commit/9142c21980383eda52341ae3575041d24c48cebd)
- Added truncation support for the 'Highest Trait Floor' text on the list modal [3f75179](https://github.com/reservoirprotocol/reservoir-kit/commit/3f751792dd328e79bee6c02de8a5bba9cd7a279b)

## [v0.4.13-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/14c41b1b2049b33212096589800daa46a843dddf) (2022-10-13)

- Improve performance when calculating attribute count [6455159](https://github.com/reservoirprotocol/reservoir-kit/commit/6455159bef35d820eed4c4ac5b733499de581f8a)
- Fix performance issues when BidModal renders too many attributes in selector, fix minor BidModal attribute issues [616e28e](https://github.com/reservoirprotocol/reservoir-kit/commit/616e28e96767b1740890d380854d50439a047b20)
- Fix issue with long modals unable to be scrolled [4d44363](https://github.com/reservoirprotocol/reservoir-kit/commit/4d44363bc94badc9f5a9631fb87bbb9b82adbee9)

## [v0.4.12-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/473d9e5cad7d296ea77498784f998a251e6ef2c4) (2022-10-12)

- Fix useCollectionActivity using wrong version (v2 => v3) [7e4e054](https://github.com/reservoirprotocol/reservoir-kit/commit/7e4e054f4fc6789797bba4d8127c513e208d3fa8)

## [v0.4.11-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/24ebd22f3c745007f68e468532900517e858e9fb) (2022-10-12)

- Fix ETH icon on safaris [650af0e](https://github.com/reservoirprotocol/reservoir-kit/commit/650af0e74c36ea697687b290584c8f0e4b586db0)

## [v0.4.10-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/b51269313c50973182d3bddd835e6ff3a3f11c9a) (2022-10-11)

- Omit users from useUsersActivity hook options to prevent typescript error [89c2f8b](https://github.com/reservoirprotocol/reservoir-kit/commit/89c2f8bb2b0157559d86f9290a8b5a24852ee86c)

## [v0.4.9-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/8cde782bcba4d7e07e40e908540357dc4056e422) (2022-10-11)

- Add useUsersActivity hook and update useCollectionActivity hook to v3 [822d07f](https://github.com/reservoirprotocol/reservoir-kit/commit/822d07f6d2771847c0c9091b0e238dcb5a50f878)

## [v0.4.8-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/acb45d5b5a046badf991ac40743b47605ce36a6f) (2022-10-06)

- Exporse `setSize` [4cd02d7](https://github.com/reservoirprotocol/reservoir-kit/commit/4cd02d7191481ff120caf3338e04671e71d91a95)

## [v0.4.7-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/bb0ff0f49cf32dbb00a77c277225d58158a14201) (2022-10-05)

- Fix an issue where a fee calculation causes an overflow [c588d81](https://github.com/reservoirprotocol/reservoir-kit/commit/c588d81a22a435fd834c85457a6cbc020d4fc08d)

## [v0.4.6-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/3c5f38932011362d4a0254d32ceb3cb0fdd42ce4) (2022-10-04)

- Add useUserTopBids hook [a7ca009](https://github.com/reservoirprotocol/reservoir-kit/commit/a7ca009314c1440687d6c3e96b58b66c45195c82)

## [v0.4.5-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/d2358e67d6cf43ec118c637de3a2becdb29d279f) (2022-10-04)

- Merge pull request #78 from reservoirprotocol/collection-activity [736d4d7](https://github.com/reservoirprotocol/reservoir-kit/commit/736d4d71026f715ef69db4aef3826c47e2133681)
- fixed demo [90732ef](https://github.com/reservoirprotocol/reservoir-kit/commit/90732ef653987ac55c399ff30c501423507799a8)
- add export [f3d1787](https://github.com/reservoirprotocol/reservoir-kit/commit/f3d17876cbf26e5e23dfd6702b903032c89ed49b)
- added `collectionActivity` endpoint hook [a34b586](https://github.com/reservoirprotocol/reservoir-kit/commit/a34b586328c4759e5b621b6bcc2234a4cbec03e3)

## [v0.4.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/f44e61e8bf2d5f38a66a1cfd2b4e35b7733b9ce4) (2022-10-04)

- Fix issue with ETH currency icon not aligning properly with the text [0549bd2](https://github.com/reservoirprotocol/reservoir-kit/commit/0549bd27b5170639873eebb4a7ba1a745ce8269f)
- use new `floorAskPrice` [9133feb](https://github.com/reservoirprotocol/reservoir-kit/commit/9133febab0d0497b47fbb7bf0144bb24c8e3fef1)

## [v0.4.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/4c3848cba7fb8307550c5d1f0c217d7cc2093745) (2022-10-03)

- Upgrade useBids from v3 to v4 [c126dc4](https://github.com/reservoirprotocol/reservoir-kit/commit/c126dc4cf9981191db79461dd688bbb3059f0cfc)

## [v0.4.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/ad9caa2f5e557bfc11b22e08e1231527dd593b37) (2022-09-30)

- Fix wrong version of userTokens being used in useUserTokens hook; v4 => v5 [5cca001](https://github.com/reservoirprotocol/reservoir-kit/commit/5cca00117153c3aa2db31fcacd80070970b8bb62)

## [v0.4.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/b403fe40de958b5316601629374d2bdf3b037515) (2022-09-27)

- Fix isFetchingPage calculation for hooks, add some minor fixes and tweaks for useUserTokens after testing [207c290](https://github.com/reservoirprotocol/reservoir-kit/commit/207c290ee5b5ba96df6e6d6ff1c51db7d2cd08d6)
- fix: types and pagination logic [c4b57b6](https://github.com/reservoirprotocol/reservoir-kit/commit/c4b57b6e4946c9b0c57ca0c7b5c1b0e5e15560b2)
- feat: upgrade to v5 [9cbe432](https://github.com/reservoirprotocol/reservoir-kit/commit/9cbe432775a05787471f65fec0e768911c6e5cad)
- Merge remote-tracking branch 'upstream/main' into user-tokens [5b88e33](https://github.com/reservoirprotocol/reservoir-kit/commit/5b88e33771e750fe330db0e1c1178f8a3fe20312)
- feat: add user tokens hook [fd47ead](https://github.com/reservoirprotocol/reservoir-kit/commit/fd47eadc428759267d221b9155f98b75e6311cbd)
- Add useBids hook [62851a1](https://github.com/reservoirprotocol/reservoir-kit/commit/62851a18a44bfdee28d696e0a63f61c00158f2b4)

## [v0.4.0-4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/82659f49844b8c57eb41f97ad15d71de307c0d06) (2022-09-26)

- Fix AcceptBidModal bug when approving a marketplace, Completes RES-503 [dfa611f](https://github.com/reservoirprotocol/reservoir-kit/commit/dfa611fa04a8b15e1b5d728c8517f313cc32926b)
- fixed attribute offer autofill [f25ce5a](https://github.com/reservoirprotocol/reservoir-kit/commit/f25ce5a703cf75dc08b89a9768bbc0daa1045984)
- fix spacing and dimensions accept bid modal [c5f3359](https://github.com/reservoirprotocol/reservoir-kit/commit/c5f3359529630caa43a7c0266ac28804c2a46010)

## [v0.4.0-3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/36aa57aaac8d2fe6318a1ce04b8c506a632b51cf) (2022-09-26)

- Merge branch 'main' of github.com:reservoirprotocol/reservoir-kit [16a3598](https://github.com/reservoirprotocol/reservoir-kit/commit/16a3598ed30dee2dd9beb760a9bbbc815db7b20e)

## [v0.4.0-rc.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/ce968895fddca38536387e0502ce95cc4aa56457) (2022-09-23)

- added `floorPrice` [2e20373](https://github.com/reservoirprotocol/reservoir-kit/commit/2e20373e158f2e5ca2e48581072e98018bbf2a50)
- export `useAttributes` [41e8d78](https://github.com/reservoirprotocol/reservoir-kit/commit/41e8d7874d3432c7d7ab2f143e8da45efa051d8d)
- simplified scrollarea [3eb7402](https://github.com/reservoirprotocol/reservoir-kit/commit/3eb7402dda962981dd67ce33cad31bcb28bd4afa)
- added weth address [26d177b](https://github.com/reservoirprotocol/reservoir-kit/commit/26d177b9277f551223613679533328b824c5d33d)

## [v0.4.0-rc.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/9041ebe8c788ce2fbc543abece8d7702441abfc4) (2022-09-23)

- Reuse CryptoCurrencyIcon component instead of redirect currency url when necessary [8f86349](https://github.com/reservoirprotocol/reservoir-kit/commit/8f86349375c2d04607ef005df7dcf43deb118063)
- cleanup [c1ff8dd](https://github.com/reservoirprotocol/reservoir-kit/commit/c1ff8dd248eb8539f9299b639ab8d7b789d5af4a)
- Fix bug where opensea api returns no data [c00d782](https://github.com/reservoirprotocol/reservoir-kit/commit/c00d782eb4937b908e14da9c8b991a65d7ad184b)
- created `SelectedAttribute.tsx` [a31f6ff](https://github.com/reservoirprotocol/reservoir-kit/commit/a31f6ffd53ccc0db2ef62d28ea36a47962d8c6ea)
- Adjust ERC20 listing logic [6903031](https://github.com/reservoirprotocol/reservoir-kit/commit/6903031b2dfad79dd8e786d540438a452dbcce39)
- misc. changes [1253e2f](https://github.com/reservoirprotocol/reservoir-kit/commit/1253e2fab3bb8ff274ae753299b57c8c7828cd2d)
- misc changes [42fbdae](https://github.com/reservoirprotocol/reservoir-kit/commit/42fbdae8cbe54512fea1ad162cb00fe1f61ba891)
- misc changes [dd365a9](https://github.com/reservoirprotocol/reservoir-kit/commit/dd365a91dcc6d7955403aba9b9ab5b278007aadc)
- changed spacing [5034a7e](https://github.com/reservoirprotocol/reservoir-kit/commit/5034a7e9b5c4f9e7ff2a1a62977cd63e53566607)
- Support ERC20 on the ListModal [f373897](https://github.com/reservoirprotocol/reservoir-kit/commit/f373897988597efb7f4d3769a134f413ee022fa0)
- mobile support [9e4065e](https://github.com/reservoirprotocol/reservoir-kit/commit/9e4065e300fd6aa9ef0abeea38c04e6484c7e373)

## [v0.4.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/04d58f181669b7426466bdbb57f51763550de3fb) (2022-09-20)

- BREAKING: Break up fees into referral and marketplace to reduce confusion and allow for flexibility [fb7ff72](https://github.com/reservoirprotocol/reservoir-kit/commit/fb7ff72958fbf1592670a31439231684c0060564)
- misc. changes [cb07e82](https://github.com/reservoirprotocol/reservoir-kit/commit/cb07e82c0f16a080fc8c1532db41eeb033fc2312)
- misc changes [d883e51](https://github.com/reservoirprotocol/reservoir-kit/commit/d883e51cb6f7da2a12638dd9f926f6fb1c0afc88)
- first commit [c728a81](https://github.com/reservoirprotocol/reservoir-kit/commit/c728a81fc26e2ed73525e6f7b1daf38e9710d8ff)

## [v0.3.7-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/b222a9251a4b440ca1a0849538114ddea14c2747) (2022-09-16)

- fix all tooltip spacing [f879a03](https://github.com/reservoirprotocol/reservoir-kit/commit/f879a03e97cad562f1ef3013c1e5a634a4c0b79e)
- fix popover spacing [3292e54](https://github.com/reservoirprotocol/reservoir-kit/commit/3292e5462928e572a3b0db118c59b31a59a1754e)

## [v0.3.6-rc.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/403c1b7e7e9c76e54fe8f06410e1289d227ca339) (2022-09-16)

- Revert "✨ Prerelease ui package v0.3.6-rc.2" wrong version [8e6e987](https://github.com/reservoirprotocol/reservoir-kit/commit/8e6e9871e798635baa91b64d75afae11354547ba)
- ✨ Prerelease ui package v0.3.6-rc.2 [b307b23](https://github.com/reservoirprotocol/reservoir-kit/commit/b307b2332807275829e2b8c398672023fdce659f)
- make `onClose` optional [e0ab86d](https://github.com/reservoirprotocol/reservoir-kit/commit/e0ab86d12a6dac42447b7c35e6bcee1f0b014240)

## [v0.3.6-rc.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/0869b6ffcee98c866a6bb452dd7d36287caea611) (2022-09-15)

- Merge pull request #58 from reservoirprotocol/accept-bid [d2bb7fa](https://github.com/reservoirprotocol/reservoir-kit/commit/d2bb7fae39f8ba6fdce6d46f5236d5753b425077)
- misc changes [379bc26](https://github.com/reservoirprotocol/reservoir-kit/commit/379bc2651a9adb0ceb0a80214d85a89e11adeee0)

## [v0.3.6-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/b0bc0fef122540c90741b193f075440969bf9505) (2022-09-15)

- Fix rounding display error when formatting crypto [79701e0](https://github.com/reservoirprotocol/reservoir-kit/commit/79701e0c90027f4a17615a5134a8c4a2d4a29786)
- Completes RES-300: strip www from local marketplace fallback name [35bc9da](https://github.com/reservoirprotocol/reservoir-kit/commit/35bc9dae35e787352eea757da72063ecc8a69587)
- PR feedback for REST-304 [2a3d2dc](https://github.com/reservoirprotocol/reservoir-kit/commit/2a3d2dc689368beb9482d606a477528159978974)
- Add version headers for rk ui [9fef72b](https://github.com/reservoirprotocol/reservoir-kit/commit/9fef72be3dfd82d9634e82c147bb0ed97a24f1d8)
- Add check for unsupported MutationObserver browsers [e34382b](https://github.com/reservoirprotocol/reservoir-kit/commit/e34382b60890c4a4594c05095ff03143d36cb099)
- Completes RES-304: ensure rk theme class is always present on the body tag [10220f3](https://github.com/reservoirprotocol/reservoir-kit/commit/10220f324f5d8f58212468be89856df57e004b0c)
- Merge branch 'accept-bid' of https://github.com/reservoirprotocol/reservoir-kit into accept-bid [c43f8e2](https://github.com/reservoirprotocol/reservoir-kit/commit/c43f8e235e4a552ef7c36583f459e54cbb9b1d8e)
- misc changes [8bb8d69](https://github.com/reservoirprotocol/reservoir-kit/commit/8bb8d699b70c1812f8f0acb9b8fc8772272b2801)
- Resolves RES-222: better artblocks support [7e6501f](https://github.com/reservoirprotocol/reservoir-kit/commit/7e6501f6a4715d60a17c91b2d6c67740247ad815)
- Add tooltip info copy [1c04aed](https://github.com/reservoirprotocol/reservoir-kit/commit/1c04aed0c91e0cc7d0fa182b7d875635d711fde4)
- removed `onGoToToken` [0dec17a](https://github.com/reservoirprotocol/reservoir-kit/commit/0dec17a6da5ec86c0a320d0e568669dbd269eac1)
- moved expires to prop [2fc975d](https://github.com/reservoirprotocol/reservoir-kit/commit/2fc975d4b95fa1b77616ff08a9ec0ce7265c5e2b)
- fixed progress indicator [b61983d](https://github.com/reservoirprotocol/reservoir-kit/commit/b61983d41928b265c841c0820eee827a67b93954)
- Remove reset css file in demo and apply mini resets in each rk component [947dba0](https://github.com/reservoirprotocol/reservoir-kit/commit/947dba0d3024b9459fe2de937e5ed866641ce649)
- misc fixes [23a9073](https://github.com/reservoirprotocol/reservoir-kit/commit/23a90735f5fe68867481cdc72210a883b0695053)

## [v0.3.5-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/ea9ca4be73f1c4ab2120b93d2e2da670194ab9d9) (2022-09-12)

- added fees [fafaffe](https://github.com/reservoirprotocol/reservoir-kit/commit/fafaffed5ee1ca4d2b8215cf82fd30f36b3c3907)

## [v0.3.4-rc.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/675064b91a5cd8485e08db711405f384cb4ccf5d) (2022-09-09)

- added item data [97f2724](https://github.com/reservoirprotocol/reservoir-kit/commit/97f2724fb8ca2784c1fbe514cfd708ca3f4e552d)
- Completes RES-178: BuyModal erc20 support [766cd7e](https://github.com/reservoirprotocol/reservoir-kit/commit/766cd7eaf2bfb7e5713842964353dd1727f0bcb9)
- first commit [16bee9b](https://github.com/reservoirprotocol/reservoir-kit/commit/16bee9bbb0d3239d933210236687d15b6ebf6c45)

## [v0.3.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/6ecb51e3bf336587bd023dbd8e8e30180194a2cc) (2022-09-01)

- Expose set size in infinite hooks [7c4b26a](https://github.com/reservoirprotocol/reservoir-kit/commit/7c4b26a9ae3c8ed2434bb1290e0326ad4a08cf19)

## [v0.3.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/e97ef7b64b10739a2c4118788265d8b65896ef89) (2022-09-01)

- Convert useTokens to be use pagination [bb7d301](https://github.com/reservoirprotocol/reservoir-kit/commit/bb7d301caf3ca90c2f57420b0541d90b20e30227)
- Resolves RES-183: upgrade token details api to tokens/v5 api [643efc0](https://github.com/reservoirprotocol/reservoir-kit/commit/643efc029bc67fa661ab96bc6fe2cfaec9286c2c)
- Completes RES-184: upgrading useCollections to v5 [f20c7c4](https://github.com/reservoirprotocol/reservoir-kit/commit/f20c7c407a18a89665297b1921e54530a59c01cd)
- Completes RES-185: upgrading useListings to v3 [13fb070](https://github.com/reservoirprotocol/reservoir-kit/commit/13fb07085e63902277ea5243f2857f1ecd10af2d)

## [v0.3.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/2bcc6af106477c192178d0817896655146feeaec) (2022-08-30)

- Fix bid modal feedback and bugs [a64430f](https://github.com/reservoirprotocol/reservoir-kit/commit/a64430fbfbed03ab62fc6ce4605e3002fbec0247)

## [v0.3.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/36a837f34c31ef1b78fac082bd33d3f053a274cc) (2022-08-29)

- Add bid modal callbacks [8c8f58b](https://github.com/reservoirprotocol/reservoir-kit/commit/8c8f58b525830ae8021af959e6eda9425596fac3)

## [v0.2.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/00f93e90fcd2ac772cc4603e124b9d2d619e0d33) (2022-08-29)

- Rename TokenOfferModal to BidModal [3769973](https://github.com/reservoirprotocol/reservoir-kit/commit/3769973240c2b788e8984bd2b1e20d643fec2a7e)

## [v0.2.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/a0218f00babbfb24d984419d0792520f25970616) (2022-08-29)

- Revert "Rename TokenOffer to Bid" [42d8070](https://github.com/reservoirprotocol/reservoir-kit/commit/42d8070d56bf9e7e2d5d3bcdcc5fb0b2abf110fc)
- 🎉 Release ui package v0.2.0 [a2b81f3](https://github.com/reservoirprotocol/reservoir-kit/commit/a2b81f3562915f4a0bb829c34e4cca3354461662)
- Rename TokenOffer to Bid [0a208f7](https://github.com/reservoirprotocol/reservoir-kit/commit/0a208f7524d21f9190ebe9cec856587edcd8ddde)
- Remove custom/same toggle on list modal when only one marketplace selected [03a6011](https://github.com/reservoirprotocol/reservoir-kit/commit/03a6011ecf193faf53fbf91020dde19aab1e6a09)
- Fix token offer modal responsiveness [35fa9fb](https://github.com/reservoirprotocol/reservoir-kit/commit/35fa9fb39b14b1e800a64ada7f154551c89f1808)
- Fix token offer modal responsiveness [1db9853](https://github.com/reservoirprotocol/reservoir-kit/commit/1db98531164af2804e0c606ed3b05ad6bdda51af)
- Merge branch 'bid-modal' of github.com:reservoirprotocol/reservoir-kit into bid-modal [5bb8b5f](https://github.com/reservoirprotocol/reservoir-kit/commit/5bb8b5fb4cff32f08940b965a7340b4e2e1f9394)
- Merge branch 'calendar' into bid-modal [28de076](https://github.com/reservoirprotocol/reservoir-kit/commit/28de076ffce0bf7448f5fac4054d221678f6e8c7)
- Css calendar fixes [1c86dee](https://github.com/reservoirprotocol/reservoir-kit/commit/1c86deed043d67fc48bad79840763d6dfc5f8971)
- Clear transaction error when closing modal [d5dd04e](https://github.com/reservoirprotocol/reservoir-kit/commit/d5dd04e61493de69a2d29a38dc4e686e4ff56561)
- Support for collection offer [ac1a564](https://github.com/reservoirprotocol/reservoir-kit/commit/ac1a564e8337d6b883b76338cb017a882eb1269d)
- misc changes [47c394e](https://github.com/reservoirprotocol/reservoir-kit/commit/47c394e4ea80f4198c5f6fe15c33c561fd71aa3a)
- set hover state to neutral colors [59e04bc](https://github.com/reservoirprotocol/reservoir-kit/commit/59e04bc8a952c0b9ed5e72e854644490b228766f)
- misc fixes [b887938](https://github.com/reservoirprotocol/reservoir-kit/commit/b8879386191cf0c184130d444b881dc1c21f2e40)
- Merge branch 'feature/bid-modal-transaction' into feature/bid-modal-success [c87ad71](https://github.com/reservoirprotocol/reservoir-kit/commit/c87ad71dfb6fb2713623c0525890f06977cdaf90)
- Merge branch 'bid-modal' into feature/bid-modal-transaction [52cb363](https://github.com/reservoirprotocol/reservoir-kit/commit/52cb36377002f0b014f2cb12754e6b43af1a1841)

## [v0.1.14-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/cf32637670de204e1993c1063d20d7a131dff7f0) (2022-08-26)

- Add success screen for bid modal [aeff397](https://github.com/reservoirprotocol/reservoir-kit/commit/aeff3970ce17b403865fb1371fa1aed58eccd1e5)
- Bid modal transaction progress [866546d](https://github.com/reservoirprotocol/reservoir-kit/commit/866546dd529db32fa2230b5d78915d0594341bfe)
- misc changes [6883d55](https://github.com/reservoirprotocol/reservoir-kit/commit/6883d5564b05c3cbf05ae87da2e3da517a74efa0)
- added colors [dc5717a](https://github.com/reservoirprotocol/reservoir-kit/commit/dc5717afac87af07c85e40f8e163b56c162468f4)
- Set Price and uniswap converting [8490adc](https://github.com/reservoirprotocol/reservoir-kit/commit/8490adc248895f662850b8bf295c4a253f972dc1)
- Resolve conflicts [9885e23](https://github.com/reservoirprotocol/reservoir-kit/commit/9885e232d11d7405a7bff9a7665d523112a020d0)
- Remove unnecessary dependency [eb101a3](https://github.com/reservoirprotocol/reservoir-kit/commit/eb101a3ecd9ff39b39a7d90b86168a426324006a)

## [v0.1.13-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/3579b3a4e3ff018a71207db3264782781caa973c) (2022-08-24)

- Resolve conflicts [d4aba6b](https://github.com/reservoirprotocol/reservoir-kit/commit/d4aba6b9b30879c9803b36b27b7784b775b6abb6)
- Merge pull request #45 from reservoirprotocol/feature/approval-updates [9773c13](https://github.com/reservoirprotocol/reservoir-kit/commit/9773c131238a7a289fc092c9eb229fbe3ffa2387)
- Fix minor issue when checking if fee exists [26a88e3](https://github.com/reservoirprotocol/reservoir-kit/commit/26a88e3187de6c3d9397c2e9732ba3230180f748)
- Address pr feedback [0ad234a](https://github.com/reservoirprotocol/reservoir-kit/commit/0ad234af512d7b96f2d019991e1322144aca1902)
- Fix a few issues [807d214](https://github.com/reservoirprotocol/reservoir-kit/commit/807d214caf14be1b83f0e6aaa0cff86456bacec6)
- Fix bps fee for listing and buying [43d99c7](https://github.com/reservoirprotocol/reservoir-kit/commit/43d99c7126d5e75ab84e93bff7e60292305e6279)
- Upgrade radix switch and popover, fix a bug when an unavailable item is selected an then an available item is selected with the same buy modal [f73b5d7](https://github.com/reservoirprotocol/reservoir-kit/commit/f73b5d72e79704b0c70b2c79ae9d239134f72f82)
- Upgrade radix dialog and select to prevent recursive issue when using two dismissable layer contexts from different versions [f9118df](https://github.com/reservoirprotocol/reservoir-kit/commit/f9118df20d7d6b5e67248a65ae71353c0efc239c)
- set price step ui [5da2227](https://github.com/reservoirprotocol/reservoir-kit/commit/5da2227ecf93f949f0c68236e31d0863168ba175)
- Convert date option to time [6091832](https://github.com/reservoirprotocol/reservoir-kit/commit/609183223ad6d4f05dd13b65bc7bb38c06549f80)
- Functional datepicker [9c56625](https://github.com/reservoirprotocol/reservoir-kit/commit/9c5662500614e9fb7ce582787eeb667559ef292f)
- wip date input [1ef9a7e](https://github.com/reservoirprotocol/reservoir-kit/commit/1ef9a7eca8603eee105cd9aaf7d90086a8953184)
- Fix icons viewbox whitespace [ea4cfff](https://github.com/reservoirprotocol/reservoir-kit/commit/ea4cfffdb09e18b5005f68f45012d8a8a05b8bd7)
- Reusable components for bid modal, initial shell [fd1c594](https://github.com/reservoirprotocol/reservoir-kit/commit/fd1c59415ca38a5499bfe9b255d6237bd99b9f1d)

## [v0.1.12-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/bf17c52bce1c464491fa8e5d057756169862d9d9) (2022-08-17)

- For native seaport order listing we are improving the step title when approving/signing on for a marketplace to gain permissions [8d3e944](https://github.com/reservoirprotocol/reservoir-kit/commit/8d3e944c6bdd782310c08b2f67f199376333d4a4)
- Only warn for additional approvals other than the native market orderKind [556d7f2](https://github.com/reservoirprotocol/reservoir-kit/commit/556d7f297d5b33bdcbc92ecde5977f54706249c7)
- Fix buy modal token name ellipsifying [9f1e992](https://github.com/reservoirprotocol/reservoir-kit/commit/9f1e992b989735779bedd0e0060c720cd1064082)

## [v0.1.11-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/d17e8f23199c353e2e9feb4833fbfa38ae581521) (2022-08-15)

- Fix listings hook [26ccd72](https://github.com/reservoirprotocol/reservoir-kit/commit/26ccd72f400ff609dfbdadaf22d17b7803bee33d)

## [v0.1.10-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/a537ab678a26cbac14782f250cd52bc70c234405) (2022-08-12)

- use price vs true price in listing value [2d1f9f7](https://github.com/reservoirprotocol/reservoir-kit/commit/2d1f9f7bc70383c6b7b431c0b12095edd61e5ac1)

## [v0.1.9-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/3940c722678df5abc1d2c8291ce0f59b735c53e0) (2022-08-11)

- Fix token name and ellipsification on complete screen [2560ce9](https://github.com/reservoirprotocol/reservoir-kit/commit/2560ce931c09fc454745a63f55fd4619b6d4665d)

## [v0.1.8-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/61f89f8ef68a6cbe375ccab19c5c706ae8ea0262) (2022-08-11)

- Token images using object cover to maintain aspect ratio [4bb7f9c](https://github.com/reservoirprotocol/reservoir-kit/commit/4bb7f9c775aa1710898d5215431735e1120a74ad)

## [v0.1.7-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/0694a42031772f1514c324bdc8ffcc6fd7e3c585) (2022-08-11)

- Reapply missing onblur code [a4eec81](https://github.com/reservoirprotocol/reservoir-kit/commit/a4eec81d109debac8502cdc8eac9a9dd2a276c73)
- Reapply list modal changes [0a1a09c](https://github.com/reservoirprotocol/reservoir-kit/commit/0a1a09c80aa73676df93eb24954db31984888895)
- Rename Modal to modal [f7c4f3a](https://github.com/reservoirprotocol/reservoir-kit/commit/f7c4f3a7c93f489e85e2ff7ae431e21dfff16912)
- Fix copy, add expiration selector title, fix focusing UI [166d4fc](https://github.com/reservoirprotocol/reservoir-kit/commit/166d4fc29d7a8988fd7e16e7820514b0fd0c0909)

## [v0.1.6-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/0aea8292791d9d316addfa73b88fa3c5cfe426ab) (2022-08-11)

- Fix issue with truePrice sometimes being an empty string [016d883](https://github.com/reservoirprotocol/reservoir-kit/commit/016d883c9dfc790279135ba74e36da9db865a8a0)
- Merge branch 'main' of github.com:reservoirprotocol/reservoir-kit [caf43ce](https://github.com/reservoirprotocol/reservoir-kit/commit/caf43ce7b92d8e06d0115cf9ec880c6c5bc359c9)
- Fix issue with truePrice sometimes being an empty string [6a2e77a](https://github.com/reservoirprotocol/reservoir-kit/commit/6a2e77a5c96fffaa75371d6c1f4cf9cc368395f8)
- Rename modal file [5bad102](https://github.com/reservoirprotocol/reservoir-kit/commit/5bad102f25fa4a55460005d700a6db4de65f1fef)

## [v0.1.5-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/5fa137fdc99943deee974b0352eb07a3739bf70f) (2022-08-10)

- Fix issue with marketplaces being overridden when list modal loads [24dc372](https://github.com/reservoirprotocol/reservoir-kit/commit/24dc372d35ae0a0277abb7efc88497bbc47250f9)

## [v0.1.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/989e3f768921b3be2429ed24ffbe68cf0083257a) (2022-08-10)

- Fix initial syncprice race condition [f90249e](https://github.com/reservoirprotocol/reservoir-kit/commit/f90249e786e9657bea1b42243886c52f80b1c833)
- Prevent NaN error when truePrice is a string [e5cdef0](https://github.com/reservoirprotocol/reservoir-kit/commit/e5cdef0075b5c40ffe672984aea550bd5b995aa1)

## [v0.1.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/5bda78ed0ccb707d536887cafda7aacade3e6a88) (2022-08-10)

- Cleanup some logic [bd556cb](https://github.com/reservoirprotocol/reservoir-kit/commit/bd556cb9726c0cb08084968e4d840de5c6f780ce)
- Add toggle group to list modal and repace sync switch [f78e40b](https://github.com/reservoirprotocol/reservoir-kit/commit/f78e40b5442a223d672ad548c2624ba345266385)
- Merge pull request #40 from reservoirprotocol/chore/listing-ui-fixes [90a7124](https://github.com/reservoirprotocol/reservoir-kit/commit/90a71241a3ed3a91218cbc32f5a707cb57148dad)
- zeros, debounce, and more digits [0625c25](https://github.com/reservoirprotocol/reservoir-kit/commit/0625c2595dec40be4e5f8d1c0715b8f136af926f)
- Fix marketplace images broken [0dec603](https://github.com/reservoirprotocol/reservoir-kit/commit/0dec60349f93d118f857dfff3c935e7cacdc5c82)
- Tweak unapproved listing ux [74c399a](https://github.com/reservoirprotocol/reservoir-kit/commit/74c399adad22c2cb4efecf8e2d8b90d8cb23394b)
- hi [0e82561](https://github.com/reservoirprotocol/reservoir-kit/commit/0e8256108564ab41e887f8b845d1ebaedc56cbd1)
- Use immutable SWR hook for getting the marketplaces [5757fb2](https://github.com/reservoirprotocol/reservoir-kit/commit/5757fb2721df6fcaef8339f09ee29985e3f42213)
- Fix copy, price syncing and input border theming [460d4aa](https://github.com/reservoirprotocol/reservoir-kit/commit/460d4aa5e89e8fbf63ce8867fe5bdbdeec22501e)

## [v0.1.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/180583053d45caa08b662109a2c82d08dce6c522) (2022-08-08)

## [v0.1.1-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/afe6939fde38a24835c2c79e53d69fdaf9b16cc1) (2022-08-08)

- Fix invalid BN value, marketplace hook called when closed [4417663](https://github.com/reservoirprotocol/reservoir-kit/commit/4417663c0fc9423a5b4e9cd686c5b2d3ea24e383)
- Fix bug with ownerListings query type [40193a4](https://github.com/reservoirprotocol/reservoir-kit/commit/40193a4308983e94aae53f3cab2865457f8e842e)

## [v0.1.0-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/149bf6687ee108c5e3c569168c71ed32d59ca927) (2022-08-08)

- Fix package json for workspace [c74fc03](https://github.com/reservoirprotocol/reservoir-kit/commit/c74fc03ac35552c7f3d663295e00cb5800511db4)
- Fix bugs [197f3a8](https://github.com/reservoirprotocol/reservoir-kit/commit/197f3a8c36dd6233434dcfdeb0d4d61165fef916)
- Upgrade to collections v3 [259535c](https://github.com/reservoirprotocol/reservoir-kit/commit/259535cf98f636f3f563f5df425218fb11b03fd3)
- Export data as subject and export response as data [ca9380b](https://github.com/reservoirprotocol/reservoir-kit/commit/ca9380be05e4b76f24f5adc881c19bc989d9db01)
- Merge branch 'listing-ui' into feature/use-listings-hook [46289f3](https://github.com/reservoirprotocol/reservoir-kit/commit/46289f32bf4d0c28b7306526fb2b222265aea07d)
- Fix type inference [6095932](https://github.com/reservoirprotocol/reservoir-kit/commit/6095932a0d3d6c7c06ade92808d875f52b6c25c5)
- Add infinite loading on listing hook [f0eedf4](https://github.com/reservoirprotocol/reservoir-kit/commit/f0eedf416d00522b9e2e253ba6e1b405de8258d1)
- Cleanup listings hooks [8979f83](https://github.com/reservoirprotocol/reservoir-kit/commit/8979f8344a51870b18ee9d5554d46290d9cc3517)
- Fix some typescript errors, add callbacks to list modal for complete and error [13bdfc6](https://github.com/reservoirprotocol/reservoir-kit/commit/13bdfc6b88dd64c6a6217c520e394af8c02587e6)
- Cleanup memo code [91f3e23](https://github.com/reservoirprotocol/reservoir-kit/commit/91f3e2311435cb89ac838d29fc541017cf666dc1)
- Converting hooks to use SWR [2d9e8ab](https://github.com/reservoirprotocol/reservoir-kit/commit/2d9e8ab4ad1e88b0c05896ab2530a342863e4e35)
- add info tooltip [66c2025](https://github.com/reservoirprotocol/reservoir-kit/commit/66c20250e641e7e722b05ac45d8e82c6d554f444)
- remove comments [93a71d9](https://github.com/reservoirprotocol/reservoir-kit/commit/93a71d9c38757e7b0216656fa11189200a6039d7)
- add tooltips [032303d](https://github.com/reservoirprotocol/reservoir-kit/commit/032303d91c3af7e42ddae1d15d9ce228f0d1ad35)
- Merge pull request #35 from reservoirprotocol/feature/approval-precheck [20a63b3](https://github.com/reservoirprotocol/reservoir-kit/commit/20a63b3959e9ac3ba94a7ff3b1f520be889dad02)
- Remove unnecessary code [9ff03ca](https://github.com/reservoirprotocol/reservoir-kit/commit/9ff03cac018a278ae53f4c8713aefc08332fdace)
- Add preapproval check [131b29f](https://github.com/reservoirprotocol/reservoir-kit/commit/131b29f6afad56a393cc1aad1b8a213abdd188d9)
- Add price warning and fix royalty calc [93bb863](https://github.com/reservoirprotocol/reservoir-kit/commit/93bb86326b1927f3bd17778cadcec585857589e5)

## [v0.0.12-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/332a8ef3231df4a8008924eef81df16b4f486939) (2022-08-03)

- Improve BuyModal callbacks [88c8111](https://github.com/reservoirprotocol/reservoir-kit/commit/88c811130c5dea3e241adaf6ee45c5c228beadf3)
- Parse local marketplace name and icon [dc3987c](https://github.com/reservoirprotocol/reservoir-kit/commit/dc3987c301338211e3857326d57e5beab0c3a19a)
- Fix debouncing issues [a568460](https://github.com/reservoirprotocol/reservoir-kit/commit/a568460d436771d048516a62a189bda79b1b0e48)
- Fetch marketplaces from api [e9a0eb9](https://github.com/reservoirprotocol/reservoir-kit/commit/e9a0eb9eda9117730788112551c54404861e4704)
- Resolve conflicts [3d722f9](https://github.com/reservoirprotocol/reservoir-kit/commit/3d722f925d306dca89e7f00239c74e2bb65f5173)

## [v0.0.11-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/2dc09e3ce93ddf7c9afa450a21d6c4a2d27004b6) (2022-08-01)

- Rename misc to assets [bee2123](https://github.com/reservoirprotocol/reservoir-kit/commit/bee212373eae09e6e8361b5eb17b0a453890f7c2)
- Add theming options for eth icon [b667f9b](https://github.com/reservoirprotocol/reservoir-kit/commit/b667f9b830c64ac6f982cd563eb17911b7db3573)
- Hooking up listToken action [e3f08a2](https://github.com/reservoirprotocol/reservoir-kit/commit/e3f08a2f6540444a9db76d887946a90b07aa74c4)
- Merge branch 'listing-ui' into feature/listing-ui-execution [6d1ee36](https://github.com/reservoirprotocol/reservoir-kit/commit/6d1ee3628263d54fa74e5708d4d7c9d8313cd3c1)
- Starting a listing transaction, cleanup list modal logic [5856707](https://github.com/reservoirprotocol/reservoir-kit/commit/5856707a780543f8c8f87ed5c96e365b0a8ba54d)
- Merge pull request #29 from reservoirprotocol/chore/view-listing-button [b3901ea](https://github.com/reservoirprotocol/reservoir-kit/commit/b3901ead714bb89c1129f367177c1ee44710752a)
- add listing complete buttons and fix responsivity [e9a5238](https://github.com/reservoirprotocol/reservoir-kit/commit/e9a52380efa8ae26f49c985867bb0911922374cf)
- switch step immediately after clicking to buy [7c3409f](https://github.com/reservoirprotocol/reservoir-kit/commit/7c3409f1d47597d335b133da6b0bb51744cf274f)
- Merge pull request #27 from reservoirprotocol/feature/listing-modal-confirmation [571e001](https://github.com/reservoirprotocol/reservoir-kit/commit/571e001fc90a111e357c8e2518d883bd650c9d7a)
- switch back to default step [d90e500](https://github.com/reservoirprotocol/reservoir-kit/commit/d90e50045776debf706f1fdf2bbfcc8578716bbf)
- add listing modal confirmation screen [849bd70](https://github.com/reservoirprotocol/reservoir-kit/commit/849bd703c68c307f588664a3f042cc6c05d9e398)
- Upgrade all execute steps to use new step -> items structure [8e3d3a7](https://github.com/reservoirprotocol/reservoir-kit/commit/8e3d3a76bc9562ba2a32f5563717337a147a69a6)

## [v0.0.10-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/8efb1abed7cc352916ec9535d92245f5f29046f9) (2022-07-27)

- Specify wagmi minimum, fix balance polling to only run when open [1b208b1](https://github.com/reservoirprotocol/reservoir-kit/commit/1b208b1b82fb63ae49de399458f0d6497454e63e)
- Merge branch 'listing-ui' into feature/batch-listing-api [cd4b27c](https://github.com/reservoirprotocol/reservoir-kit/commit/cd4b27c3e506708c56c431094afd74548244405e)
- Resolve conflicts [833f23a](https://github.com/reservoirprotocol/reservoir-kit/commit/833f23ae96ba39e1e7d0b8ade40da22d06c8caaa)
- Resolve conflicts [ab0bf7b](https://github.com/reservoirprotocol/reservoir-kit/commit/ab0bf7b620d943b14f6c4ca34268af93b9328b65)

## [v0.0.9-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/0180173b9936fa49547e83a689d80d18dd64888c) (2022-07-27)

- wip upgrading execute functions [9d87845](https://github.com/reservoirprotocol/reservoir-kit/commit/9d8784505a4a51e32fe997cb5376b86f3d9f7abb)
- resolve conflicts [7437ec8](https://github.com/reservoirprotocol/reservoir-kit/commit/7437ec8b379bec42fa6cd2682c2dc86a4565ea80)
- Merge pull request #24 from reservoirprotocol/chore/expiration-select [49eb621](https://github.com/reservoirprotocol/reservoir-kit/commit/49eb62177de3eb3e88fe29c6884259aa695b78d3)
- ListModal Listing step [bb1da00](https://github.com/reservoirprotocol/reservoir-kit/commit/bb1da003991168a0d581a4828e9e7e95019b18ef)
- expiration select progress [8622988](https://github.com/reservoirprotocol/reservoir-kit/commit/86229880dc7512b3ae683ae51736a5259e64e9ac)
- Wip upgrading execute methods [7017f32](https://github.com/reservoirprotocol/reservoir-kit/commit/7017f328bb20f2b25519c4ecfe397c0eb756b012)
- Resolve conflicts [edf68c8](https://github.com/reservoirprotocol/reservoir-kit/commit/edf68c87ce1587d50843d464a2f9c14c9cdfcb6d)
- Fix select [da17f79](https://github.com/reservoirprotocol/reservoir-kit/commit/da17f792569775336e9694822695da35faca7166)

## [v0.0.8-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/874df0366084cb77e76c15d9f07274e0b7f4122c) (2022-07-25)

- Fix long token name [f8cfc63](https://github.com/reservoirprotocol/reservoir-kit/commit/f8cfc63a042d56521b5fd887ec574e2fe25a6760)
- select [a5c218a](https://github.com/reservoirprotocol/reservoir-kit/commit/a5c218af09cfef27b07bab3ef1928e4f26d8ae61)
- Fix support for customizing the border radius [6718eb7](https://github.com/reservoirprotocol/reservoir-kit/commit/6718eb7ec3087621eb407502c42bbecc323d194d)
- cleanup [3845192](https://github.com/reservoirprotocol/reservoir-kit/commit/38451921d69f51862f06b4332ac7aef16033d58c)
- add price selection [3ca496f](https://github.com/reservoirprotocol/reservoir-kit/commit/3ca496f6c5e3c27dbc06519b2e3b0b777d943cea)
- add token + collection data [d88aab3](https://github.com/reservoirprotocol/reservoir-kit/commit/d88aab32b322e22ba57f72ec254d4c40aaae7242)
- add mobile styles [f675250](https://github.com/reservoirprotocol/reservoir-kit/commit/f675250f04660762b3d7772e4c784b1bd91d0457)
- start listing ui [c8ad65e](https://github.com/reservoirprotocol/reservoir-kit/commit/c8ad65efa5a0a387554a4cb3c38eb260690a1978)

## [v0.0.7-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/33ff81e507249e45783e502b53d31351d1b6d463) (2022-07-21)

- Remove lastSale from renderer data [a5745fb](https://github.com/reservoirprotocol/reservoir-kit/commit/a5745fb5bc8c79ed7a2f229eecfa1389ab638f56)
- Merge branch 'main' of github.com:reservoirprotocol/reservoir-kit [95fd18f](https://github.com/reservoirprotocol/reservoir-kit/commit/95fd18f3c24997e3cec0c2709e2a80a22284a6df)
- Fix royalty miscalculation [4cbf528](https://github.com/reservoirprotocol/reservoir-kit/commit/4cbf528e1ede7f5ab8e41e72b4db33f5050ac422)
- Merge pull request #21 from reservoirprotocol/feature/remove-historical-hook [3a9f9f2](https://github.com/reservoirprotocol/reservoir-kit/commit/3a9f9f239097d0fe577857e740746d2ab9d7aaa6)
- Manually pass in next version [af34c3f](https://github.com/reservoirprotocol/reservoir-kit/commit/af34c3fce3909eca6df5fdce0397712e7bf06563)

## [v0.0.6-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/b7d235390f53c92bdadf0b65cb1b764e86614f55) (2022-07-21)

- Fix version update scripts [6144d46](https://github.com/reservoirprotocol/reservoir-kit/commit/6144d46b82c693215c2d2a31ac4587c3d842ad1c)

## [v0.0.5-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/3abba61e2a857e4322fa0e544322c29210e01a6d) (2022-07-21)

- Tweak the singleton pattern to be easier to use [1e3c4d3](https://github.com/reservoirprotocol/reservoir-kit/commit/1e3c4d31d1ae5ae8a7998fe7529a77627382e16d)
- Remove useHistoricalSales hook in favor of lastSell from token details [d103611](https://github.com/reservoirprotocol/reservoir-kit/commit/d10361105c3233e2cd3028757564f7cee44096ad)
- Rename core package to client package [32e9b66](https://github.com/reservoirprotocol/reservoir-kit/commit/32e9b66f09177937a607dd3a4d71e102c0d82fb0)
- Cleanup internal buy modal renderer state when modal is closed [59cf215](https://github.com/reservoirprotocol/reservoir-kit/commit/59cf2158617d03011eb98dbc0e8ea7a5389c38ea)
- Add ability to optionally remove powered by reservoir footer [958bbcf](https://github.com/reservoirprotocol/reservoir-kit/commit/958bbcf545a06cf57de2a035ee42f6e9dbb23a74)
- Allow setting an apikey via the provider [80eea89](https://github.com/reservoirprotocol/reservoir-kit/commit/80eea89459c5273369379d1c8f4c6d7899ad844c)
- Add getting started documentation [77f3fff](https://github.com/reservoirprotocol/reservoir-kit/commit/77f3ffff98693c2ce031c82d8367f88c67e20747)
- Change the default well color for the light theme [bd955ee](https://github.com/reservoirprotocol/reservoir-kit/commit/bd955ee68d38ed1acbdaa7701eb9c2fc9a24e36b)
- 🎉 ui v0.0.5 [efd5909](https://github.com/reservoirprotocol/reservoir-kit/commit/efd59098caae67f9afe3b0df467dcf363d207fde)
- Add headline to Text headings components [54f7464](https://github.com/reservoirprotocol/reservoir-kit/commit/54f7464e2ab593ab91d92a8c4a5bc21cce33fdf9)
- Add package script to update versions [9347027](https://github.com/reservoirprotocol/reservoir-kit/commit/93470273f78bbfeec8558444fc1c5c8d6363b3a5)

## [v0.0.4-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/dc4b51b508344ef8c34ba837d2bd525ae89a22fd) (2022-07-20)

- Fix some copy, convert transferFunds png to svg [3797a14](https://github.com/reservoirprotocol/reservoir-kit/commit/3797a14efe22143536354882760e5df7b5a6bcae)
- Fix popover not accessible, listing and bidding undefined options, low res add funds image [9231187](https://github.com/reservoirprotocol/reservoir-kit/commit/923118706766345f77def57dffae0f40337d8cc3)

## [v0.0.3-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/80c06c978fa9c24c47b751b62e8160974aa13669) (2022-07-19)

- Fix broken image in a slightly different case [f08d1e4](https://github.com/reservoirprotocol/reservoir-kit/commit/f08d1e475b9c41d1acf7f4b1aea8a81c82582bca)

## [v0.0.2-UI](https://github.com/reservoirprotocol/reservoir-kit/commit/2972fd4f1689072b1b7fdb965004ed69f8c4aa12) (2022-07-19)

- Fix broken image on token [c02dba9](https://github.com/reservoirprotocol/reservoir-kit/commit/c02dba90e7b9d850869da63304cb3daa79529d2c)
- Add a complete callback and fix some bugs [31e4567](https://github.com/reservoirprotocol/reservoir-kit/commit/31e4567f496161ec24df032450045756a4e81089)
- Fix zindex [d655fed](https://github.com/reservoirprotocol/reservoir-kit/commit/d655fed95bce92b7b0583a7fb94b75b45183c482)
- Fix type error with headlineFont override [16854aa](https://github.com/reservoirprotocol/reservoir-kit/commit/16854aa04ae093639f24cdbfff4f8f06368f83d5)
- Merge branch 'main' of github.com:reservoirprotocol/reservoir-kit [ba68de3](https://github.com/reservoirprotocol/reservoir-kit/commit/ba68de3acf5ee64aad2245d773fbc6c22a507b3b)
- Add relative image paths to decrease package size [573228c](https://github.com/reservoirprotocol/reservoir-kit/commit/573228cacf80ddbf3f2ed4aa3fdae0b81b1cda85)
- Merge pull request #15 from reservoirprotocol/feature/wagmi [e1ebfdf](https://github.com/reservoirprotocol/reservoir-kit/commit/e1ebfdf94f2a8fe89dce130b7d4e8f67578d186d)
- Fix folder name [92e6f40](https://github.com/reservoirprotocol/reservoir-kit/commit/92e6f4037bdef6ae1a69afd849a732930267e309)
- Add wagmi, use wagmi hooks for balance, address and chain etherscan link [2eca2ed](https://github.com/reservoirprotocol/reservoir-kit/commit/2eca2edfe26f9c6edee675784f9f5d5628dbbf40)
- Fix typescript error [7b1719e](https://github.com/reservoirprotocol/reservoir-kit/commit/7b1719ec35262ef38699373441ae79fc5e8cf72b)
- Add headless renderer to buy modal [16fa977](https://github.com/reservoirprotocol/reservoir-kit/commit/16fa97772acebe2c95a8173041be07b97cecc754)
- Upgrade radix dialog to fix mobile issue, remove border on mobile [cf0b4be](https://github.com/reservoirprotocol/reservoir-kit/commit/cf0b4beaf6026d939aecb9aa6d92dc564f91076c)
- Mobile tweaks [20a46d5](https://github.com/reservoirprotocol/reservoir-kit/commit/20a46d58a77abbad2fafa93e892575659290e7b4)
- Update confirming image [bb56262](https://github.com/reservoirprotocol/reservoir-kit/commit/bb56262172064c3f2c43cd995e4fb8d7943ccafb)
- Resolve conflicts [37bf315](https://github.com/reservoirprotocol/reservoir-kit/commit/37bf3158b4486473ffbf6abf7639d18bf2456d4d)
- Refresh eth usd marketprice whenever the modal opens [6930b0b](https://github.com/reservoirprotocol/reservoir-kit/commit/6930b0bf01ed60941fb8fc9c25b8c5c9342e478c)
- mobile view [96c532e](https://github.com/reservoirprotocol/reservoir-kit/commit/96c532e32cd1b0492f6775a86f9b402fbcb5d7c4)
- add success screen [3994f1f](https://github.com/reservoirprotocol/reservoir-kit/commit/3994f1f13294bfccce933ff3120941549b277f9f)
- Add transaction hash to progress state [9d8f312](https://github.com/reservoirprotocol/reservoir-kit/commit/9d8f312aab644a6c005995b0a3c03595620f827b)
- Finish up unavailable ui and last sale [51dcfaf](https://github.com/reservoirprotocol/reservoir-kit/commit/51dcfaf4aae12d80163cc4788c06fb49c23e4730)
- resolve conflicts [33b81cd](https://github.com/reservoirprotocol/reservoir-kit/commit/33b81cd431b1e971da19f76b93a0a9a5fcbe2a14)
- resolve conflicts [d6663a6](https://github.com/reservoirprotocol/reservoir-kit/commit/d6663a6070a023b499bd54504549b246a925b82f)
- stop infinite loop [11090c7](https://github.com/reservoirprotocol/reservoir-kit/commit/11090c78baa0fa5db7834a713345ee10588c5d45)
- Resolve conflicts [9d80087](https://github.com/reservoirprotocol/reservoir-kit/commit/9d800872678f75e5be9e0af55f06d74b2b32de91)
- Update progress step gifs [d97c82d](https://github.com/reservoirprotocol/reservoir-kit/commit/d97c82dd4c2fab2814f1753fb16de494d8c2e894)
- fix merge conflict [947b629](https://github.com/reservoirprotocol/reservoir-kit/commit/947b6295842e7cc93a6674356c2c0b4384f25b58)
- add sus token ui [9c569b9](https://github.com/reservoirprotocol/reservoir-kit/commit/9c569b9847f902ab592d8cc481c82d40e26bbcff)
- Buymodal transaction progress [7ada667](https://github.com/reservoirprotocol/reservoir-kit/commit/7ada667c9b2d33575391d3282ee7b743187fab8b)
- Add modal loader, clean up states and referrer fee [acef798](https://github.com/reservoirprotocol/reservoir-kit/commit/acef798e6309c1ef5bcd47be2002cd09c9cb6759)
- Resolve conflicts [691eb70](https://github.com/reservoirprotocol/reservoir-kit/commit/691eb7088535d07d283081a76f6dad408e2966a1)
- Resolve conflicts [79587f6](https://github.com/reservoirprotocol/reservoir-kit/commit/79587f6b2fe176956e9d027babd665877182e419)
- ui fixes and loading state [69e76a9](https://github.com/reservoirprotocol/reservoir-kit/commit/69e76a97cc810f1e75219ad6c0c18990e5cf40da)
- Add a theme interface that holds all the require properties for the theme [2775ae5](https://github.com/reservoirprotocol/reservoir-kit/commit/2775ae5fbfbd44c8e6c8e0c275ad3c2e3772675f)
- add theme switcher [555e576](https://github.com/reservoirprotocol/reservoir-kit/commit/555e5765b9ce24f5c167123a4de1e805a5f5204c)
- add light and dark themes [bee2e7e](https://github.com/reservoirprotocol/reservoir-kit/commit/bee2e7e64075d49f29c5b0a3695820e7b4707597)
- wip modal loader [20f4eca](https://github.com/reservoirprotocol/reservoir-kit/commit/20f4eca4a8defc05bf3012775963fa6f60dfe17e)
- Fix conflicts [0e63067](https://github.com/reservoirprotocol/reservoir-kit/commit/0e63067414a35eb5c8f2e18f53a5cf441018cd67)
- Get signer and signer details [ff0a661](https://github.com/reservoirprotocol/reservoir-kit/commit/ff0a661f6e6bd4249a6c6980b1432bd549abb333)
- Expose transaction hash in steps when available [6fc19f1](https://github.com/reservoirprotocol/reservoir-kit/commit/6fc19f1ed87dd348b243441dec1dd99710d4efc6)
- Add wallet connect to the demo page, insufficient funds placeholder and buy token call [804eeba](https://github.com/reservoirprotocol/reservoir-kit/commit/804eebad243497a1b1cf105e95aae605ebf6c896)
- Fix conflicts [3836c38](https://github.com/reservoirprotocol/reservoir-kit/commit/3836c38c0bd754323ff9a5b07c209e87fa36e1ff)
- Export useCoreSdk hook from index [642945c](https://github.com/reservoirprotocol/reservoir-kit/commit/642945c269cf5eed35d75ce975b0e65ab04b2afd)
- Make sure sdk is initialized first [b38ab51](https://github.com/reservoirprotocol/reservoir-kit/commit/b38ab513c50855ef14592a67451fe7a943f1fe0f)
- create add funds step + clean up theme and imports [08e31ec](https://github.com/reservoirprotocol/reservoir-kit/commit/08e31ecfd5af341db73eee79876631603c919bd1)
- Add useCoreSdk hook and store sdk in context for easy usage [ca0784b](https://github.com/reservoirprotocol/reservoir-kit/commit/ca0784b19c2b58077de3d17654fd8c47dbc977e3)
- Add banned on opensea hook [a16ab36](https://github.com/reservoirprotocol/reservoir-kit/commit/a16ab365948f15644184270f634cb215e26d11f2)
- Add core context provider [2fae2a6](https://github.com/reservoirprotocol/reservoir-kit/commit/2fae2a6608faf71ff432f05614d9e9d823ebfaf1)
- Exporting hooks [f794b8d](https://github.com/reservoirprotocol/reservoir-kit/commit/f794b8d269e1cbdf03e44974f107577664aa566e)
- Update packages [38c889e](https://github.com/reservoirprotocol/reservoir-kit/commit/38c889e04f8a56f258f45709008ff96868897abb)
- Buy modal initial screen [7fddec2](https://github.com/reservoirprotocol/reservoir-kit/commit/7fddec29081cdabcc8d162e3564d8fb7ff5c1bc6)
- rename modal folder [c396489](https://github.com/reservoirprotocol/reservoir-kit/commit/c3964898180e0784fe55ad3def1d506d6a40c87d)
- Rename client-sdk to reservoir-kit-core, rename reservoir-kit to reservoir-kit-ui [6f57826](https://github.com/reservoirprotocol/reservoir-kit/commit/6f57826858578442f39fa9ef80c25fbc5540aad7)