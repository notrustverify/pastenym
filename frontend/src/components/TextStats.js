import * as React from 'react'
import Typography from '@mui/joy/Typography'
import InfoOutlined from '@mui/icons-material/InfoOutlined'

class TextStats extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Typography
                level="body2"
                startDecorator={<InfoOutlined />}
                sx={{
                    alignItems: 'flex-start',
                    maxWidth: 500,
                    wordBreak: 'break-all',
                }}
            >
                {'Views: ' +
                    this.props.num_view +
                    ' - ' +
                    'Created on: ' +
                    new Date(this.props.created_on).toLocaleString()}
            </Typography>
        )
    }
}

export default TextStats
