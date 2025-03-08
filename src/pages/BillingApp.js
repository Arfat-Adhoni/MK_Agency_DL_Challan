import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Modal,
  Button,
  Table,
  Container,
  Row,
  Col,
  Form,
  Card,
} from "react-bootstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./BillingApp.css";
import medicineOptions from "./MedicineInfo";
import CreatableSelect from "react-select/creatable";

const BillingApp = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    quantity: "",
    freeQuantity: "",
    mfgDate: "",
    expDate: "",
  });

  const [editIndex, setEditIndex] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [clientName, setClientName] = useState("");
  const [referenceNo, setReferenceNo] = useState("");

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [invoiceDate, setInvoiceDate] = useState(formatDate(new Date()));
  const [errorMessage, setErrorMessage] = useState("");

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setInvoiceDate(formatDate(selectedDate));
  };

  const now = new Date();
const formattedDate = `${String(now.getDate()).padStart(2, "0")}_${String(
  now.getMonth() + 1
).padStart(2, "0")}_${now.getFullYear()}_${String(
  now.getHours()
).padStart(2, "0")}_${String(now.getMinutes()).padStart(2, "0")}_${String(
  now.getSeconds()
).padStart(2, "0")}`;

  const generatePDF = () => {
    if (!clientName || !referenceNo || items.length === 0) {
      setErrorMessage(
        "Please enter Client Name, Order No, and add at least one Medicine before generating the invoice."
      );
      return;
    }
    setErrorMessage("");
    const doc = new jsPDF();

    // Header Section
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 139);
    doc.text("M/S M.K Agencies", 105, 15, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Wholesale Distributors", 105, 22, { align: "center" });
    doc.text("Sainik School 2nd Gate, Athani Road, Vijayapur - 586101", 105, 28, { align: "center" });
    doc.text("Mob: 7760608777", 105, 34, { align: "center" });

    doc.setDrawColor(0, 0, 0);
    doc.line(20, 45, 190, 45);

    // Invoice Details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`To,`, 20, 50);
    doc.text(`Name: ${clientName}`, 20, 55);
    doc.text(`Date: ${invoiceDate}`, 20, 61);
    doc.text(`Reference No: ${referenceNo}`, 20, 68);

    

    doc.autoTable({
      head: [
        [
          "Name",
          "Mfg Date",
          "Exp Date",
          "Paid Qty",
          "Free Qty",
          "Total Qty",
          "Price/Qty",
          "Total",
        ],
      ],
      body: items.map((item) => [
        item.name,
        item.mfgDate,
        item.expDate,
        item.quantity,
        item.freeQuantity,
        item.quantity + item.freeQuantity,
        item.price,
        item.total,
      ]),
      startY: 80,
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 3, valign: "middle" },
      headStyles: { fillColor: [0, 0, 139], textColor: [255, 255, 255], fontSize: 10 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      columnStyles: {
        6: { halign: "right" },
        7: { halign: "right" },
      },
    });
    
    // Calculate and display total amount
    const totalAmount = `Total Amount: ${items
      .reduce((acc, item) => acc + item.total, 0)
      .toFixed(2)}`;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(totalAmount, 150, doc.autoTable.previous.finalY + 10, { align: "right" });
    
    // Horizontal Line
    doc.setDrawColor(0, 0, 0);
    doc.line(20, doc.autoTable.previous.finalY + 20, 190, doc.autoTable.previous.finalY + 20);
    
    // Delivery Challan Section
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 139);
    doc.text("System-Generated Delivery Challan", 20, doc.autoTable.previous.finalY + 30);
    
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(
      "This delivery challan is auto-generated and does not require a signature.",
      20,
      doc.autoTable.previous.finalY + 40
    );
    
    // Note about Date Format
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Note: All dates are in format YYYY-MM-DD", 20, doc.autoTable.previous.finalY + 50);
    
    // Save PDF with formatted timestamp
    doc.save(`${clientName.replace(/\s+/g, "")}_Invoice_${formattedDate}.pdf`);
  };


  const handleAddItem = () => {
    if (
      !newItem.name ||
      !newItem.price ||
      !newItem.quantity ||
      !newItem.mfgDate ||
      !newItem.expDate
    )
      return;

    setItems([
      ...items,
      {
        ...newItem,
        totalQuantity:
          (parseInt(newItem.quantity) || 0) +
          (parseInt(newItem.freeQuantity) || 0),
        total: newItem.price * newItem.quantity,
      },
    ]);

    setNewItem({
      name: "",
      price: "",
      quantity: "",
      freeQuantity: "",
      mfgDate: "",
      expDate: "",
    });
  };

  const calculateTotal = () => items.reduce((acc, item) => acc + item.total, 0);

  const handleEdit = (index) => {
    setNewItem(items[index]);
    setEditIndex(index);
    setShowPopup(true);
  };

  const handleUpdateItem = () => {
    if (
      newItem.name &&
      newItem.price &&
      newItem.quantity &&
      newItem.mfgDate &&
      newItem.expDate
    ) {
      const updatedItems = [...items];
      updatedItems[editIndex] = {
        ...newItem,
        totalQuantity:
          (parseInt(newItem.quantity) || 0) +
          (parseInt(newItem.freeQuantity) || 0),
        total: newItem.price * newItem.quantity,
      };
      setItems(updatedItems);
      setNewItem({
        name: "",
        price: "",
        quantity: "",
        freeQuantity: "",
        mfgDate: "",
        expDate: "",
      });
      setEditIndex(null);
      setShowPopup(false);
    }
  };

  const handleDelete = (index) => setItems(items.filter((_, i) => i !== index));

  return (
    <Container className="py-4">
      <Card className="shadow-lg p-4">
        <h2 className="text-primary mb-2 text-center">M/S M.K Agencies</h2>
        <h5 className="text-muted text-center">Wholesale Distributors</h5>
        <h6 className="text-secondary text-center">
          Sainik School 2nd Gate Athani Road, Vijayapur 586101 Mob : 7760608777
        </h6>

        <hr />

        <h4 className="text-center text-primary">Client Details</h4>
        <Card className="p-3 mb-4 border-dark">
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter client name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Order No</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Order number"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Date (MM/DD/YYYY)</Form.Label>
                <Form.Control
                  type="date"
                  value={invoiceDate.split("/").reverse().join("-")}
                  onChange={handleDateChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card>

        <h4 className="text-center text-primary">Medicine Details</h4>
        <Card className="p-3 mb-4 border-dark">
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Medicine Name</Form.Label>
                <CreatableSelect
                  options={medicineOptions}
                  value={
                    medicineOptions.find(
                      (option) => option.value === newItem.name
                    ) || { label: newItem.name, value: newItem.name }
                  }
                  onChange={(selectedOption) =>
                    setNewItem({
                      ...newItem,
                      name: selectedOption ? selectedOption.value : "",
                    })
                  }
                  placeholder="Search or Enter Medicine"
                  isSearchable
                  isClearable
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Manufacturing Date (MM/DD/YYYY)</Form.Label>
                <Form.Control
                  type="date"
                  value={newItem.mfgDate}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      mfgDate: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>Expiry Date (MM/DD/YYYY)</Form.Label>
                <Form.Control
                  type="date"
                  value={newItem.expDate}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      expDate: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter price"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      price: parseFloat(e.target.value) || "",
                    })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Paid Quantity</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter quantity"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      quantity: parseInt(e.target.value) || "",
                    })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Label>Free Quantity</Form.Label>
              <Form.Control
                type="number"
                placeholder="Free Quantity"
                value={newItem.freeQuantity}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    freeQuantity: parseInt(e.target.value) || "",
                  })
                }
              />
            </Col>
          </Row>
          <Button variant="primary" onClick={handleAddItem} className="w-100">
            Add Item
          </Button>
        </Card>

        <h4 className="text-center text-primary">Delivery Challan Details</h4>
        <Table striped bordered hover responsive>
          <thead className="bg-primary text-white">
            <tr>
              <th>Medicine</th>
              <th>Price</th>
              <th>Paid Qty</th>
              <th>Free Qty</th>
              <th>Total Qty</th>
              <th>MFG Date</th>
              <th>EXP Date</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>₹{item.price}</td>
                <td>{item.quantity}</td>
                <td>{item.freeQuantity}</td>
                <td>{item.totalQuantity}</td>
                <td>{item.mfgDate}</td>
                <td>{item.expDate}</td>
                <td>₹{item.total}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(index)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(index)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {errorMessage && (
          <p className="text-danger text-center">{errorMessage}</p>
        )}
        <h4 className="text-end text-success">Total: ₹{calculateTotal()}</h4>
        <Button variant="success" onClick={generatePDF} className="mt-3 w-100">
          Generate Delivery Challan
        </Button>
      </Card>
      <Modal show={showPopup} onHide={() => setShowPopup(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
  <Form.Group>
    <Form.Label>Medicine Name</Form.Label>
    <CreatableSelect
      options={medicineOptions}
      value={
        medicineOptions.find((option) => option.value === newItem.name) || 
        { label: newItem.name, value: newItem.name }
      }
      onChange={(selectedOption) =>
        setNewItem({ ...newItem, name: selectedOption.value })
      }
      placeholder="Search or Enter Medicine"
      isSearchable
      isClearable
    />
  </Form.Group>

  {/* New Manufacturing Date Field */}
  <Form.Group>
    <Form.Label>Manufacturing Date (MM/DD/YYYY)</Form.Label>
    <Form.Control
      type="date"
      value={newItem.mfgDate}
      onChange={(e) =>
        setNewItem({
          ...newItem,
          mfgDate: e.target.value,
        })
      }
    />
  </Form.Group>

  {/* New Expiry Date Field */}
  <Form.Group>
    <Form.Label>Expiry Date (MM/DD/YYYY)</Form.Label>
    <Form.Control
      type="date"
      value={newItem.expDate}
      onChange={(e) =>
        setNewItem({
          ...newItem,
          expDate: e.target.value,
        })
      }
    />
  </Form.Group>

  <Form.Group>
    <Form.Label>Paid Quantity</Form.Label>
    <Form.Control
      type="number"
      value={newItem.quantity}
      onChange={(e) =>
        setNewItem({
          ...newItem,
          quantity: parseInt(e.target.value) || "",
        })
      }
    />
  </Form.Group>

  <Form.Group>
    <Form.Label>Free Quantity</Form.Label>
    <Form.Control
      type="number"
      value={newItem.freeQuantity}
      onChange={(e) =>
        setNewItem({
          ...newItem,
          freeQuantity: parseInt(e.target.value) || "",
        })
      }
    />
  </Form.Group>

  <Form.Group>
    <Form.Label>Price</Form.Label>
    <Form.Control
      type="number"
      value={newItem.price}
      onChange={(e) =>
        setNewItem({
          ...newItem,
          price: parseFloat(e.target.value) || "",
        })
      }
    />
  </Form.Group>

  
</Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPopup(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateItem}>
            Update Item
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BillingApp;
