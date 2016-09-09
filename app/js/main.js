( function() {

	var quiz = {
		/*
		 * game content including
		 * questions, answers and
		 * explanation is stored here
		 */
		data: {
			"gamecontent": [ {
				"question": "Which planet in our solar system is larger (in diameter) than Neptune?",
				"image": "neptune.jpg",
				"choices": [ "Mars", "Jupiter", "Earth", "Venus", "Mercury" ],
				"correct": "Jupiter",
				"explanation": "",
			}, {
				"question": "What is the second-most common element on the sun?",
				"image": "sun.jpg",
				"choices": [ "Oxygen", "Helium", "Nitrogen", "Hydrogen" ],
				"correct": "Hydrogen",
				"explanation": "",
			}, {
				"question": "How quickly is our moon moving away from our planet?",
				"image": "moon.jpg",
				"choices": [ "3.8 cm / hour", "3.8 cm / week", "3.8 cm / year", "38.8 cm / year" ],
				"correct": "3.8 cm / year",
				"explanation": "",
			}, {
				"question": "How many golf balls are on the moon right now?",
				"image": "golfball.jpg",
				"choices": [ "None", "Three", "One", "Fifteen" ],
				"correct": "Three",
				"explanation": "",
			}, ],
		},

		init: function() {
			this.questionCounter = 0;
			this.currentScore = 0;
			this.correctAnswers = 0;
			this.wrongAnswers = 0;
			this.playerName = "";
			this.animationSpeed = 500;
			this.totalQuestions = this.data.gamecontent.length;

			this.cacheDom();
			this.render();
			this.cacheDomAfterCompilation();
			this.bindEvents();
			this.answerRender();

			this.$questions.hide();
			this.$questions.first()
				.fadeIn( this.animationSpeed );

			/* Debug Mode: Turn off modal & speed up anims */
			this.debugMode = false;

			if ( this.debugMode ) {
				this.$loginModal.hide();
				this.$quizContainer.removeClass( "blur" );
				this.$metaContainer.removeClass( "blur" );
				this.playerName = "debug";
				this.$usernamePlaceholder.text( this.playerName );
				this.animationSpeed = 100;
			}
		},

		cacheDom: function() {
			this.$source = $( "#gamecontainer" )
				.html();
			this.$template = Handlebars.compile( this.$source );
			this.$quizContainer = $( "#quizcontainer" );
		},

		cacheDomAfterCompilation: function() {
			// main game elements
			this.$questions = this.$quizContainer.find( ".astro-question" );
			this.$answers = this.$quizContainer.find( ".answer" );
			// controls & meta
			this.$resetButton = $( ".reset" );
			this.$metaContainer = $( ".astro-meta" );
			this.$gameScore = $( ".gamescore" );
			// personalization
			this.$loginModal = $( '.astro-modal-login' );
			this.$usernameField = this.$loginModal.find( '.astro-username-input' );
			this.$usernameSubmit = this.$loginModal.find( '#username-submit' );
			this.$usernamePlaceholder = $( '.playername-placeholder' );
		},

		bindEvents: function() {
			this.$answers.on( "click", this.answerClicked );
			this.$resetButton.on( "click", this.resetClicked.bind( this ) );
			this.$usernameSubmit.on( "click", this.nameSubmitted.bind( this ) );
			this.$usernameField.val( '' )
				.focus();
			this.$usernameField.keypress( function( e ) {
				if ( e.which == 13 ) {
					quiz.nameSubmitted();
				}
			} );
		},

		nameSubmitted: function() {
			this.playerName = this.$usernameField.val();
			// debug
			if ( quiz.debugMode ) {
				console.log( this.playerName );
			}
			this.$loginModal.fadeOut( this.animationSpeed );
			this.$quizContainer.removeClass( "blur" );
			this.$metaContainer.removeClass( "blur" );
			this.$usernamePlaceholder.text( this.playerName );
		},

		answerClicked: function() {
			var $el = $( this );
			var clickedAnswer = $el.text();
			var correctAnswer = quiz.data.gamecontent[ quiz.questionCounter ].correct;

			if ( clickedAnswer === correctAnswer ) {
				// answer is correct 👍
				// debug
				if ( quiz.debugMode ) {
					console.log( "user chose: " + clickedAnswer + " /// " + "correct answer: " + correctAnswer );
				}
				$el.addClass( "answer-correct animated tada" );
				quiz.answerRender( true );
			} else {
				// answer is incorrect 👎
				// debug
				if ( quiz.debugMode ) {
					console.log( "user chose: " + clickedAnswer + " /// " + "correct answer: " + correctAnswer );
				}
				$el.addClass( "answer-wrong animated shake" );
				quiz.answerRender( false );
			}

			// unbind and remove hover effect
			$el.siblings()
				.andSelf()
				.off()
				.removeClass( "answer-active" );

			// on to the next question! ✅
			quiz.questionCounter++;
			quiz.nextQuestion();
		},

		nextQuestion: function() {
			// if we still have questions left, render next question. else render final screen/scoreboard
			setTimeout( function() {
				var $questionCounter = quiz.$questions.eq( quiz.questionCounter - 1 );
				var $nextQuestion = quiz.$questions.eq( quiz.questionCounter );
				if ( quiz.questionCounter < quiz.data.gamecontent.length ) {
					$questionCounter.fadeOut( this.animationSpeed, function() {
						$nextQuestion.delay( this.animationSpeed )
							.fadeIn( this.animationSpeed );
					} );

				} else {
					$questionCounter.fadeOut( this.animationSpeed, function() {
						quiz.scoreRender();
					} );
				}
			}, ( this.animationSpeed * 2 ) );

		},

		resetClicked: function() {
			this.$quizContainer.addClass( "blur" );
			this.$metaContainer.addClass( "blur" );
			this.$loginModal.fadeIn( this.animationSpeed );
			this.init();
		},

		answerRender: function( bingo ) {
			if ( bingo === true ) {
				quiz.currentScore++;
				quiz.correctAnswers++;
			} else if ( quiz.currentScore > 0 && bingo === false ) {
				//quiz.currentScore--;
				quiz.wrongAnswers++;
			}
			this.$gameScore.text( quiz.currentScore );

			// debug
			if ( quiz.debugMode ) {
				console.log( "Correct answers: " + quiz.correctAnswers + " /// " + "Wrong Answers: " + quiz.wrongAnswers + " (total questions:" + quiz.totalQuestions + ")" );
				console.log( "##################################################" );
			}
			//<TODO:> add an explanation renderer here </TODO:>
		},

		scoreRender: function() {
			var scorePercentage = ( ( quiz.correctAnswers / quiz.totalQuestions ) * 100 );

			this.$scoreSource = $( "#scoretemplate" )
				.html();
			this.$scoreTemplate = Handlebars.compile( this.$scoreSource );
			this.$quizContainer.hide()
				.html( this.$scoreTemplate( this.data ) )
				.fadeIn( "slow" );
			$( ".answers-correct" )
				.text( quiz.correctAnswers );
			$( ".questions-total" )
				.text( quiz.totalQuestions );
			$( ".astro-results-percentage-bar" )
				.animate( {
					width: scorePercentage + "%"
				}, ( this.animationSpeed * 3 ) );
			$( '.playername-placeholder' )
				.text( quiz.playerName );
		},

		render: function() {
			this.$quizContainer
				.html( this.$template( this.data ) );
		},

	};

	quiz.init();

} )();
