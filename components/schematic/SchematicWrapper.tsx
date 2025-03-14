import { getTemporaryAccessToken } from "@/actions/getTemporaryAccesToken"
import SchematicEmbed from "./SchematicEmbeded"

const SchematicWrapper = async ({componentId} : {componentId : string} ) => {

    const accessToken = await getTemporaryAccessToken()

    if(!accessToken) {
        return null
    }
  return (
    <SchematicEmbed accessToken={accessToken} componentId={componentId}/>
  )
}
export default SchematicWrapper