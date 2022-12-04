import * as React from 'react'

import Box from '@mui/joy/Box'

class FileRender extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <main>
                <Box
                sx= {{
                    maxWidth: "100%",
                    height: "auto",
                    padding: 0,
                    margin: 0,
                }}
                >
                    <img
                        
                        src={this.props.fileData}
                        srcSet={`${this.props.fileData} 2x`}
                        loading="lazy"
                        alt=""
                    />
                </Box>
            </main>
        )
    }
}

export default FileRender
