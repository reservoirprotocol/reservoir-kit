import { library } from '@fortawesome/fontawesome-svg-core'
import * as Icons from '@fortawesome/free-solid-svg-icons'

import {
  IconDefinition,
  IconPack,
  IconPrefix,
} from '@fortawesome/free-solid-svg-icons'

type IconDefinitionOrPack = IconDefinition | IconPack

interface ImportedIcons {
  [key: string]: IconPrefix | IconDefinitionOrPack
}

const iconList = Object.keys(Icons)
  .filter((key) => key !== 'fa' && key !== 'prefix')
  .map((icon) => (Icons as ImportedIcons)[icon])

library.add(...(iconList as IconDefinitionOrPack[]))
