document.addEventListener('DOMContentLoaded', function () {

    const nodeManagement = {
        nodeMap: new Map(),
        focusedRoom: null,
        focusedID: null, //Too keep track of ids in instances of roomnumbers paired to more than one node
        imgWidth: 0,
        imgHeight: 0
    };

    //factory function to output node object
    function createNode(roomNumber, id, nodeShape) {
        const newNode = document.createElement('div');
        newNode.classList.add('node');
        newNode.classList.add('focused-node');

        if (nodeShape != 'rectangle') {
            newNode.classList.add(nodeShape);
        }

        if (nodeManagement.focusedRoom != null) {
            nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].node.classList.remove('focused-node');
        }

        newNode.addEventListener('click', function (event) {
            if (nodeManagement.focusedRoom !== null) {
                nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].node.classList.remove('focused-node');
            }

            nodeManagement.focusedRoom = roomNumber;
            nodeManagement.focusedID = id;

            newNode.classList.add('focused-node');
            updateNodeEditorValues(roomNumber);

            event.stopPropagation()
        })

        return {
            node: newNode,
            roomNumber: roomNumber,
            rotation: 0,
            width: 32,
            height: 32,
            xPosition: 0,
            yPosition: 0,
            shape: nodeShape,
            id: id, //for instances where a roomnumber is paired to more than one node, will be set later
            toString: function () {
                return `${this.roomNumber} ${this.width} ${this.height} ${this.rotation} ${this.xPosition} ${this.yPosition} ${this.shape} ${this.id}`
            }
        }
    }

    //node factory manager function for controlling when createNode is called
    function requestNode(roomNumber, shape) {
        if (roomNumber != '') {
            if (nodeManagement.nodeMap.has(roomNumber)) {
                const id = nodeManagement.nodeMap.get(roomNumber).length;
                nodeManagement.nodeMap.get(roomNumber).push(createNode(roomNumber, id, shape));
                nodeManagement.focusedID = id;
            } else {
                const nodeArray = new Array(createNode(roomNumber, 0, shape));
                nodeManagement.nodeMap.set(roomNumber, nodeArray, shape);
                nodeManagement.focusedID = 0;
            }

            nodeManagement.focusedRoom = roomNumber;
            document.getElementById('map-wrapper').appendChild(nodeManagement.nodeMap.get(roomNumber)[nodeManagement.focusedID].node);
            updateNodeEditorValues(roomNumber);
        } else {
            alert("invalid roomnumber");
        }
    }

    function updateNodeEditorValues(roomNumber) {
        if (typeof (roomNumber) === 'string' && nodeManagement.nodeMap.has(roomNumber)) {
            document.getElementById('room-input').value = roomNumber;
            document.getElementById('nodewidth-input').value = nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].width;
            document.getElementById('nodeheight-input').value = nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].height;
            document.getElementById('noderotation-input').value = nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].rotation;
        }
    }

    function loadData() {
        //clear map before loading new nodes from data
        if (nodeManagement.nodeMap.size !== 0) {
            nodeManagement.nodeMap.forEach((nodes, roomNumber) => {
                nodeManagement.focusedRoom = roomNumber; //will be used to delete the node in deleteNode
                deleteNode();
            })

            nodeManagement.focusedRoom = null;
            nodeManagement.focusedID = null;
        }

        const dataCollection = (document.getElementById('console').value).split(/\s+/);

        //First two tokens are skipped because they represent the width and height of img from when the map was created, the nodes created for that img size will then be scaled using those dimensions as reference 
        if (dataCollection.length > 6) {
            for (let i = 2; i < dataCollection.length - 1; i = i + 8) { //8 because theres 8 datamembers to set for the node to be fully created
                requestNode(dataCollection[i], dataCollection[i+6]);
                //nodemanagement changes
                nodeManagement.nodeMap.get(dataCollection[i])[nodeManagement.focusedID].width = dataCollection[i + 1];
                nodeManagement.nodeMap.get(dataCollection[i])[nodeManagement.focusedID].height = dataCollection[i + 2];
                nodeManagement.nodeMap.get(dataCollection[i])[nodeManagement.focusedID].rotation = dataCollection[i + 3];
                nodeManagement.nodeMap.get(dataCollection[i])[nodeManagement.focusedID].xPosition = dataCollection[i + 4];
                nodeManagement.nodeMap.get(dataCollection[i])[nodeManagement.focusedID].yPosition = dataCollection[i + 5];
                nodeManagement.nodeMap.get(dataCollection[i])[nodeManagement.focusedID].shape = dataCollection[i + 6];
                nodeManagement.nodeMap.get(dataCollection[i])[nodeManagement.focusedID].id = dataCollection[i + 7];
                document.getElementById('map-wrapper').appendChild(nodeManagement.nodeMap.get(dataCollection[i])[nodeManagement.focusedID].node);
                //css changes
                nodeManagement.nodeMap.get(dataCollection[i])[nodeManagement.focusedID].node.style.width = parseInt(dataCollection[i + 1]) + 'px';
                nodeManagement.nodeMap.get(dataCollection[i])[nodeManagement.focusedID].node.style.height = parseInt(dataCollection[i + 2]) + 'px';
                nodeManagement.nodeMap.get(dataCollection[i])[nodeManagement.focusedID].node.style.transform = `rotate(${dataCollection[i + 3]}deg)`;
                nodeManagement.nodeMap.get(dataCollection[i])[nodeManagement.focusedID].node.style.left = parseInt(dataCollection[i + 4]) + 'px';
                nodeManagement.nodeMap.get(dataCollection[i])[nodeManagement.focusedID].node.style.top = parseInt(dataCollection[i + 5]) + 'px';
            }

            scaleNodes(dataCollection[0], dataCollection[1]);
        }
    }

    //grabs all exisitng nodes and maintains aspect ration as the map-wrapper size grows or shrinks
    function scaleNodes(originalWidth, originalHeight) {
        if ((originalWidth !== 0) && (originalHeight !== 0)) {
            const newWidth = parseInt(window.getComputedStyle(document.getElementById('floorplan')).width);
            const newHeight = parseInt(window.getComputedStyle(document.getElementById('floorplan')).height);
            const widthRatio = newWidth / originalWidth;
            const heightRatio = newHeight / originalHeight;

            //multiply node dimensions bt aspectRatio
            nodeManagement.nodeMap.forEach((value, key) => {
                value.forEach((element) => {
                    element.width = Math.round((element.width) * widthRatio);
                    element.height = Math.round((element.height) * heightRatio);
                    element.xPosition = Math.round((element.xPosition) * widthRatio);
                    element.yPosition = Math.round((element.yPosition) * heightRatio);
                    //css changes
                    element.node.style.width = element.width + 'px';
                    element.node.style.height = element.height + 'px';
                    element.node.style.left = element.xPosition + 'px';
                    element.node.style.top = element.yPosition + 'px';
                })
            })
            updateNodeEditorValues(nodeManagement.focusedRoom);
        }
    }

    //needs to be usable as a function reference and callable function so no parameters are used
    function deleteNode() {
        nodeManagement.nodeMap.get(nodeManagement.focusedRoom).forEach((element) => { //deletes all nodes attached to that room
            element.node.remove();
        })
        nodeManagement.nodeMap.delete(nodeManagement.focusedRoom)
    }

    const roomNumberInput = document.getElementById('room-input');
    roomNumberInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            requestNode(roomNumberInput.value, document.getElementById('shape-selection').value);
        }
    })

    const addButton = document.getElementById('addnode');
    addButton.addEventListener('click', function () {
        requestNode(roomNumberInput.value, document.getElementById('shape-selection').value);
    })

    const nodeWidthInput = document.getElementById('nodewidth-input');
    nodeWidthInput.addEventListener('input', function () {
        nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].width = parseInt(nodeWidthInput.value);
        nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].node.style.width = nodeWidthInput.value + 'px';
    })

    const nodeHeightInput = document.getElementById('nodeheight-input');
    nodeHeightInput.addEventListener('input', function () {
        nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].height = parseInt(nodeHeightInput.value);
        nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].node.style.height = nodeHeightInput.value + 'px';
    })

    const nodeRotationInput = document.getElementById('noderotation-input');
    nodeRotationInput.addEventListener('input', function () {
        nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].rotation = parseInt(nodeRotationInput.value);
        nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].node.style.transform = `rotate(${nodeRotationInput.value}deg)`;
    })

    const deleteButton = document.getElementById('deletenode');
    deleteButton.addEventListener('click', deleteNode);

    const imgFilePathInput = document.getElementById('imgpath-input');
    imgFilePathInput.addEventListener('keydown', function(event){
        if (event.key ===  'Enter'){
            document.getElementById('floorplan').src = imgFilePathInput.value;
        }
    })

    const imgWidthInput = document.getElementById('imgwidth-input');
    imgWidthInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            const originalWidth = parseInt(window.getComputedStyle(document.getElementById('floorplan')).width);
            const originalHeight = parseInt(window.getComputedStyle(document.getElementById('floorplan')).height);

            console.log(originalWidth + " " + originalHeight);

            document.getElementById('floorplan').style.width = imgWidthInput.value + 'px';

            nodeManagement.imgWidth = window.getComputedStyle(document.getElementById('floorplan')).width;
            nodeManagement.imgHeight = window.getComputedStyle(document.getElementById('floorplan')).height;
            scaleNodes(originalWidth, originalHeight);
        }
    })


    const mapBox = document.getElementById('map-wrapper');
    mapBox.addEventListener('click', function (event) {
        if ((nodeManagement.focusedRoom !== null) && (nodeManagement.focusedID !== null)) {
            //css management
            nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].node.style.left = (event.offsetX) + "px";
            nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].node.style.top = (event.offsetY) + "px";
            //node data management
            nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].xPosition = parseInt(event.offsetX);
            nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].yPosition = parseInt(event.offsetY);
        }
    })

    const loadNodes = document.getElementById('load-nodes');
    loadNodes.addEventListener('click', loadData)

    const updateConsoleButton = document.getElementById('update-console');
    updateConsoleButton.addEventListener('click', function () {
        const mapConsole = document.getElementById('console');

        mapConsole.value = `${nodeManagement.imgWidth} ${nodeManagement.imgHeight}\n`
        nodeManagement.nodeMap.forEach((value, key) => {
            value.forEach((child) => {
                mapConsole.value = mapConsole.value + child.toString() + '\n'; //Multiple nodes are attached to the same roomnumber/(key)
            })
        })
    });

    document.addEventListener('keydown', function (event) {
        if (nodeManagement.focusedRoom != null) {
            let xPosition = parseInt(nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].node.style.left);;
            let yPosition = parseInt(nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].node.style.top);
    
    
    
            if (event.key === 'ArrowDown') {
                nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].node.style.top = (yPosition + 1) + "px";
                nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].yPosition = (nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].yPosition) + 1;
            } else if (event.key === 'ArrowUp') {
                nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].node.style.top = (yPosition - 1) + "px";
                nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].yPosition = (nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].yPosition) - 1;
            } else if (event.key === 'ArrowRight') {
                nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].node.style.left = (xPosition + 1) + "px";
                nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].xPosition = (nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].xPosition) + 1;
            } else if (event.key === 'ArrowLeft') {
                nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].node.style.left = (xPosition - 1) + "px";
                nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].xPosition = (nodeManagement.nodeMap.get(nodeManagement.focusedRoom)[nodeManagement.focusedID].xPosition) - 1;
            }
        }
    
    })
})
