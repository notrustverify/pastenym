import * as React from 'react'
import { Image } from 'mui-image'
import Box from '@mui/joy/Box'

class FileRender extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <main>
                <Box>
                    <Image
                        src={this.props.fileData}
                    />
                </Box>
            </main>
        )
    }
}

export default FileRender
