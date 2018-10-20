import React, { Component } from "react";
// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";
// core components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Button from "components/CustomButtons/Button";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import CardFooter from "components/Card/CardFooter";

import loginPageStyle from "assets/jss/material-kit-react/views/loginPage.jsx";

import { Emojione } from "react-emoji-render";
import Rating from "react-rating";
import Loading from "react-loading-spinkit";
import SweetAlert from "react-bootstrap-sweetalert";

import api from "../../config/api";
import image from "assets/img/background-initialscreens.jpg";

class LoginPage extends Component {
  state = {
    cardAnimaton: "cardHidden",
    message: "Avalie alguns locais para nos ajudar a modelar seu perfil",
    messageButton: "Avançar",
    step: 1,
    messageError: "",
    showAlert: false,
    showLoading: true,
    locations: []
  };

  componentDidMount = async () => {
    setTimeout(() => this.setState({ cardAnimaton: "" }), 700);
    const { step } = this.state;

    let id = localStorage.getItem("user");

    if (!id) {
      const email = `${Date.now()}@gmail.com`;
      const user = await api.post("users", {
        email: email
      });
      console.log(`ID do user atual: ${JSON.parse(user.data).id}`);
      localStorage.setItem("user", JSON.parse(user.data).id);
      id = JSON.parse(user.data).id;
    }

    if (step === 1) {
      const locations = await api.get("evaluation");
      const new_locations = JSON.parse(locations.data);
      const location_with_rating = [];
      new_locations.forEach(loc =>
        location_with_rating.push({
          ...loc,
          placeId: loc.id,
          rate_user: 0
        })
      );
      this.setState({ showLoading: false, locations: location_with_rating });
    }
  };

  changeStarRating = (rate, id) => {
    const { locations } = this.state;
    locations.forEach(loc => {
      if (loc.placeId === id) {
        loc.rate_user = rate;
      }
    });
    this.setState({ locations: locations });
  };

  submitRatings = async () => {
    const { step, locations } = this.state;

    let isValid = 1;

    locations.forEach(loc => {
      if (loc.rating === 0) {
        isValid = 0;
      }
    });

    if (!isValid) {
      this.setState({ showAlert: true });
    }

    if (step === 1 && isValid) {
      const id = localStorage.getItem("user");
      const new_locations = [];
      locations.forEach(loc =>
        new_locations.push({
          userId: +id,
          placeId: loc.id,
          rate: loc.rate_user
        })
      );

      this.setState({ message: "Aguarde um pouco", showLoading: true });

      await api.post("evaluation", {
        ratings: new_locations
      });

      const est_locations = await api.get(`evaluation/${id}`);
      this.setState({
        message: "Estamos quase lá! Por favor, avalie só mais alguns locais!",
        step: 2,
        showLoading: false,
        locations: est_locations.data
      });
    }

    if (step === 2 && isValid) {
      this.setState({ message: "Aguarde um pouco", showLoading: true });
      await api.post("suggestion", {
        ratings: locations
      });

      this.setState({
        message: "Obrigado!",
        step: 3,
        showLoading: false
      });
      localStorage.removeItem("user");
    }
  };

  render() {
    const { classes } = this.props;
    const {
      message,
      locations,
      step,
      messageButton,
      showLoading,
      messageError,
      showAlert
    } = this.state;
    return (
      <div>
        <SweetAlert
          warning
          show={showAlert}
          title="Atenção!"
          confirmBtnStyle={{
            backgroundColor: "#F9BE89",
            color: "#fff",
            width: "40%",
            height: "45px",
            borderRadius: "4px",
            border: "none",
            fontWeight: "bold",
            fontSize: "20px"
          }}
          confirmBtnText="Entendi"
          onConfirm={() => this.setState({ showAlert: false })}
        >
          Você precisa avalisar todos os locais para continuar
        </SweetAlert>
        <div
          className={classes.pageHeader}
          style={{
            backgroundImage: "url(" + image + ")",
            backgroundSize: "cover",
            backgroundPosition: "top center"
          }}
        >
          <div className={classes.container}>
            <GridContainer justify="center">
              <GridItem xs={12} sm={12} md={12}>
                <Card className={classes[this.state.cardAnimaton]}>
                  <CardHeader color="info" className={classes.cardHeader}>
                    <h4>
                      {message}
                      <Emojione
                        text=" :grin:"
                        onlyEmojiClassName="make-emojis-large"
                      />
                      <Emojione
                        text=" :grin:"
                        onlyEmojiClassName="make-emojis-large"
                      />
                    </h4>
                  </CardHeader>
                  <CardBody>
                    {showLoading || messageError ? (
                      <Loading show={showLoading} />
                    ) : (
                      <GridContainer style={{ textAlign: "center" }}>
                        {step === 3 ? (
                          <GridItem>
                            <div
                              style={{
                                textAlign: "center",
                                marginBottom: "20px",
                                fontWeight: "bold",
                                fontSize: "35px",
                                color: messageError ? "#ff0000" : "#00ADC0"
                              }}
                            >
                              Sua partipação nos ajudou muito!
                            </div>
                          </GridItem>
                        ) : (
                          locations.map(loc => (
                            <GridItem xs={12} sm={12} md={6} key={loc.placeId}>
                              <Card>
                                <CardBody>
                                  <h4 style={{ fontWeight: "bold" }}>
                                    {loc.name}
                                  </h4>
                                  <img
                                    src={loc.photoUrl}
                                    alt={loc.name}
                                    style={{
                                      width: "100%",
                                      height: "250px",
                                      borderRadius: "6px",
                                      marginBottom: "15px"
                                    }}
                                  />
                                  <Rating
                                    emptySymbol="far fa-star fa-2x"
                                    fullSymbol="fas fa-star fa-2x"
                                    style={{ color: "#FF982A" }}
                                    initialRating={loc.rate_user}
                                    onChange={rate =>
                                      this.changeStarRating(rate, loc.placeId)
                                    }
                                  />
                                </CardBody>
                              </Card>
                            </GridItem>
                          ))
                        )}
                      </GridContainer>
                    )}
                  </CardBody>
                  {step !== 3 && (showLoading || messageError) ? (
                    <div
                      style={{
                        textAlign: "center",
                        marginBottom: "20px",
                        fontWeight: "bold",
                        color: messageError ? "#ff0000" : "#00ADC0"
                      }}
                    >
                      {messageError ||
                        "Estamos atualizando as preferências e buscando locais :)"}
                    </div>
                  ) : (
                    ""
                  )}

                  {step !== 3 && !showLoading && !messageError ? (
                    <CardFooter className={classes.cardFooter}>
                      <div>
                        <Button
                          simple
                          color="info"
                          size="lg"
                          onClick={this.submitRatings}
                        >
                          {messageButton}
                        </Button>
                      </div>
                    </CardFooter>
                  ) : (
                    ""
                  )}

                  {showLoading || messageError ? (
                    <div />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "25px"
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: step === 1 ? "#00C4D6" : "#d3d3d3",
                          borderRadius: "50%",
                          display: "inline-block",
                          height: step === 1 ? "8px" : "5px",
                          width: step === 1 ? "8px" : "5px",
                          margin: "5px"
                        }}
                      />
                      <span
                        style={{
                          backgroundColor: step === 2 ? "#00C4D6" : "#d3d3d3",
                          borderRadius: "50%",
                          display: "inline-block",
                          height: step === 2 ? "8px" : "5px",
                          width: step === 2 ? "8px" : "5px",
                          margin: "5px"
                        }}
                      />
                      <span
                        style={{
                          backgroundColor: step === 3 ? "#00C4D6" : "#d3d3d3",
                          borderRadius: "50%",
                          display: "inline-block",
                          height: step === 3 ? "8px" : "5px",
                          width: step === 3 ? "8px" : "5px",
                          margin: "5px"
                        }}
                      />
                    </div>
                  )}
                </Card>
              </GridItem>
            </GridContainer>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(loginPageStyle)(LoginPage);
